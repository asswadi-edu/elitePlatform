<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\AiQuiz;
use App\Models\AiQuizAttempt;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AiQuizController extends Controller
{
    /**
     * Get a list of user's AI quizzes.
     */
    public function index(Request $request)
    {
        $quizzes = AiQuiz::where('user_id', $request->user()->id)
            ->with('latestAttempt')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($quizzes);
    }

    /**
     * Generate and store a new AI quiz.
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'num_questions' => 'required|integer|min:5|max:50',
            'difficulty' => 'required|string|in:simple,medium,hard',
            'file' => 'nullable|file|mimes:pdf,docx,txt,jpg,jpeg,png|max:10240',
            'language' => 'nullable|string|in:auto,ar,en',
        ]);

        $difficultyMap = ['simple' => 'بسيط', 'medium' => 'متوسط', 'hard' => 'صعب'];
        $difficultyText = $difficultyMap[$request->difficulty] ?? 'متوسط';

        $user = $request->user();

        // 1. Check user permission
        if (!$user->can('access_ai_quizzes')) {
            return response()->json(['message' => 'يجب أن تكون مشتركاً لاستخدام هذه الميزة.'], 403);
        }

        // Check user's plan limit
        $subscription = $user->subscriptions()->where('status', 1)->first();
        
        if ($subscription && $subscription->plan) {
            $plan = $subscription->plan;
            $usedThisMonth = AiQuiz::where('user_id', $user->id)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count();

            if ($usedThisMonth >= $plan->max_ai_tests) {
                return response()->json(['message' => "لقد استنفدت حقك الشهري من اختبارات الذكاء الاصطناعي ($plan->max_ai_tests)."], 403);
            }
        }

        // 2. Extract text from uploaded file
        $text = '';
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $ext = strtolower($file->getClientOriginalExtension());
            $filePath = $file->getRealPath();

            if ($ext === 'pdf') {
                try {
                    $parser = new \Smalot\PdfParser\Parser();
                    $pdf = $parser->parseFile($filePath);
                    $text = $pdf->getText();
                } catch (\Exception $e) {
                    \Log::warning('PDF parse error: ' . $e->getMessage());
                    $text = "ملف PDF باسم " . $file->getClientOriginalName();
                }
            } elseif ($ext === 'txt') {
                $text = file_get_contents($filePath);
            } elseif ($ext === 'docx') {
                try {
                    $zip = new \ZipArchive();
                    if ($zip->open($filePath) === true) {
                        $xml = $zip->getFromName('word/document.xml');
                        $zip->close();
                        $text = strip_tags(str_replace(['</w:p>', '</w:r>'], ["\n", ' '], $xml));
                    }
                } catch (\Exception $e) {
                    $text = "ملف Word باسم " . $file->getClientOriginalName();
                }
            } elseif (in_array($ext, ['jpg', 'jpeg', 'png'])) {
                // For images we pass them as base64 — only relevant for vision-capable models
                $imageData = base64_encode(file_get_contents($filePath));
                $mimeType = $file->getMimeType();
                $text = "مرفق صورة للدراسة: data:{$mimeType};base64,{$imageData}";
            } else {
                $text = "ملف باسم " . $file->getClientOriginalName();
            }

            $text = mb_substr(trim($text), 0, 30000); // Limit to ~30,000 chars (~10 pages)
        }

        // Log extraction result for debugging
        \Log::info('File text extraction result', [
            'has_file' => $request->hasFile('file'),
            'file_type' => $request->hasFile('file') ? strtolower($request->file('file')->getClientOriginalExtension()) : 'none',
            'extracted_chars' => mb_strlen($text),
            'text_preview' => mb_substr($text, 0, 200)
        ]);

        if (empty(trim($text))) {
            $text = "المادة: " . $request->subject . " (لم يتم رفع ملف أو تعذر استخراج النص، قم بتوليد أسئلة عامة في هذا التخصص)";
        }

        // 3. Call AI API
        $apiKey = SystemSetting::where('key', 'ai_test_api_key')->value('value');
        $model = SystemSetting::where('key', 'ai_test_model')->value('value') ?: 'gpt-4o';
        $baseUrl = SystemSetting::where('key', 'ai_api_base_url')->value('value');
        $promptTemplate = SystemSetting::where('key', 'ai_quiz_prompt')->value('value');

        if (!$apiKey) {
            return response()->json(['message' => 'إعدادات الذكاء الاصطناعي غير مكتملة (API Key مفقود).'], 500);
        }

        $lang = $request->language ?? 'auto';
        $langText = ($lang === 'ar') ? 'اللغة العربية الفصحى' : (($lang === 'en') ? 'English Language' : 'نفس لغة النص الأصلي');

        $prompt = str_replace(
            ['@count', '@difficulty', '@subject', '@language'],
            [$request->num_questions, $difficultyText, $request->subject, $langText],
            $promptTemplate
        );

        // Append language instruction only if @language placeholder is not used in the template
        if (!Str::contains($promptTemplate, '@language')) {
            if ($lang === 'ar') {
                $prompt .= "\n\nيجب أن يكون محتوى الاختبار (الأسئلة والخيارات) باللغة العربية الفصحى حصراً.";
            } elseif ($lang === 'en') {
                $prompt .= "\n\nThe quiz content (questions and options) must be exclusively in English.";
            }
        }

        $prompt .= "\n\nالنص الدراسي:\n" . $text;

        try {
            // Determine provider based on model name
            if (Str::contains($model, 'gpt')) {
                $endpoint = $baseUrl ?: 'https://api.openai.com/v1/chat/completions';
                $response = Http::withToken($apiKey)->withOptions(['verify' => false])
                    ->post($endpoint, [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => $prompt],
                            ['role' => 'user', 'content' => 'قم بتوليد الاختبار الآن بصيغة JSON.']
                        ],
                        'response_format' => ['type' => 'json_object']
                    ]);
            } else if (Str::contains($model, 'llama') || Str::contains($model, 'mixtral')) {
                // Groq API Integration (Compatible with OpenAI format)
                $endpoint = $baseUrl ?: 'https://api.groq.com/openai/v1/chat/completions';
                $response = Http::withToken($apiKey)->withOptions(['verify' => false])
                    ->post($endpoint, [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => $prompt],
                            ['role' => 'user', 'content' => 'قم بتوليد الاختبار الآن بصيغة JSON.']
                        ],
                        'response_format' => ['type' => 'json_object']
                    ]);
            } else if (Str::contains($model, 'gemini')) {
                 $endpoint = $baseUrl ? rtrim($baseUrl, '/') . "/v1beta/models/{$model}:generateContent?key={$apiKey}" : "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
                 $response = Http::withOptions(['verify' => false])->post($endpoint, [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
                    ]
                ]);
            }

            if (!$response->successful()) {
                Log::error('AI API Error: ' . $response->body());
                return response()->json(['message' => 'فشل الاتصال بمزود الذكاء الاصطناعي.', 'error' => $response->json()], 502);
            }

            $aiResult = $response->json();
            $questionsJson = '';

            if (Str::contains($model, 'gpt') || Str::contains($model, 'llama') || Str::contains($model, 'mixtral')) {
                $questionsJson = $aiResult['choices'][0]['message']['content'];
            } else {
                $questionsJson = $aiResult['candidates'][0]['content']['parts'][0]['text'];
            }

            // 4. Save Quiz
            $quiz = AiQuiz::create([
                'uuid' => (string) Str::uuid(),
                'user_id' => $user->id,
                'subject' => $request->subject,
                'file_name' => $request->hasFile('file') ? $request->file('file')->getClientOriginalName() : null,
                'num_questions' => $request->num_questions,
                'difficulty' => $request->difficulty,
                'questions_json' => json_decode($questionsJson, true),
                'time_limit' => $request->time_limit ?? 20,
            ]);

            return response()->json($quiz, 201);

        } catch (\Exception $e) {
            Log::error('AI Quiz Generation Failed: ' . $e->getMessage());
            return response()->json(['message' => 'حدث خطأ أثناء توليد الاختبار.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get quiz details.
     */
    public function show($uuid)
    {
        $quiz = AiQuiz::where('uuid', $uuid)->firstOrFail();
        return response()->json($quiz);
    }

    /**
     * Submit quiz answers and save attempt.
     */
    public function submit(Request $request, $uuid)
    {
        $quiz = AiQuiz::where('uuid', $uuid)->firstOrFail();
        $request->validate([
            'answers' => 'required|array',
            'time_taken' => 'required|integer',
        ]);

        $score = $this->calculateScore($quiz->questions_json, $request->answers);

        $attempt = AiQuizAttempt::create([
            'uuid' => (string) Str::uuid(),
            'ai_quiz_id' => $quiz->id,
            'user_id' => $request->user()->id,
            'score' => $score,
            'answers_json' => $request->answers,
            'time_taken' => $request->time_taken,
        ]);

        // Award points if score is high (pass)
        if ($score >= 60) {
            $pts = (int)\App\Services\PointService::getRule('points_for_quiz', 10);
            \App\Services\PointService::awardPoints($request->user()->id, $pts, "اجتياز اختبار الذكاء الاصطناعي بنجاح: {$quiz->subject}");
        }

        return response()->json([
            'attempt' => $attempt,
            'quiz' => $quiz,
            'score' => $score
        ]);
    }

    private function calculateScore($questions, $userAnswers)
    {
        // Fallback for Arabic nested keys just like React
        if (!isset($questions[0]) && !empty($questions)) {
            if (isset($questions['questions'])) $questions = $questions['questions'];
            else if (isset($questions['أسئلة'])) $questions = $questions['أسئلة'];
            else if (isset($questions['اختبار']['أسئلة'])) $questions = $questions['اختبار']['أسئلة'];
            else {
                foreach ($questions as $val) {
                    if (is_array($val) && isset($val[0])) { $questions = $val; break; }
                }
            }
        }
        
        $correctCount = 0;
        $total = is_array($questions) ? count($questions) : 0;

        foreach ($questions as $index => $q) {
            $userAns = isset($userAnswers[$index]) ? $userAnswers[$index] : null;
            $opts = $q['options'] ?? $q['opts'] ?? $q['choices'] ?? $q['خيارات'] ?? [];
            $correctAns = $q['correct'] ?? $q['answer'] ?? $q['إجابة'] ?? 0;
            
            if (empty($opts) && ((isset($q['type']) && $q['type'] === 'true_false') || (isset($q['نوع']) && $q['نوع'] === 'صح/خطأ') || is_bool($correctAns))) {
                $opts = ['صح', 'خطأ'];
                $correctAns = ($correctAns === true || $correctAns === 'صح' || (string)$correctAns === 'true') ? 0 : 1;
            }

            // Map string answer to its index in options
            if (is_string($correctAns) && !is_numeric($correctAns) && $correctAns !== 'صح' && $correctAns !== 'خطأ') {
                $foundIdx = array_search($correctAns, $opts);
                if ($foundIdx !== false) $correctAns = $foundIdx;
            }

            if ($userAns !== null && (string)$userAns === (string)(is_numeric($correctAns) ? (int)$correctAns : $correctAns)) {
                $correctCount++;
            }
        }

        return $total > 0 ? ($correctCount / $total) * 100 : 0;
    }
}
