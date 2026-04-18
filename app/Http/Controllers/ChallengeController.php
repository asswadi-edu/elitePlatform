<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\Subject;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuestionOption;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChallengeController extends Controller
{
    /**
     * Get active and past challenges for the user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->can('access_challenges')) {
            return response()->json(['message' => 'هذه الميزة تتطلب صلاحيات المشتركين.'], 403);
        }

        $myActive = Challenge::where('created_by', $user->id)
            ->where('status', '!=', 2) // Not ended
            ->with(['subject', 'creator.profile', 'participants' => function($q) use ($user) {
                $q->where('users.id', $user->id);
            }])
            ->withCount('participants')
            ->orderBy('created_at', 'desc')
            ->get();

        // Past challenges: either the challenge itself ended, OR the user completed it.
        $past = Challenge::whereHas('participants', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where(function($q) use ($user) {
                $q->where('status', 2)
                  ->orWhereHas('participants', function($pq) use ($user) {
                      $pq->where('user_id', $user->id)->where('challenge_participants.status', 1);
                  });
            })
            ->with(['subject', 'creator.profile', 'participants' => function($q) use ($user) {
                $q->where('users.id', $user->id);
            }])
            ->withCount('participants')
            ->get();

        $profile = $user->profile;
        $gold = $profile ? $profile->stars_gold : 0;
        $lvlRecord = \App\Models\ChallengeLevel::where('required_gold_stars', '<=', $gold)->orderBy('required_gold_stars', 'desc')->first();
        $nextLvlRecord = \App\Models\ChallengeLevel::where('required_gold_stars', '>', $gold)->orderBy('required_gold_stars', 'asc')->first();
        $nextLvlGold = $nextLvlRecord ? $nextLvlRecord->required_gold_stars : max($gold, 10);
        
        $userStats = [
            'level' => (int) ($lvlRecord ? $lvlRecord->level_number : 1),
            'level_name' => $lvlRecord ? $lvlRecord->name : 'مبتدئ',
            'gold' => (int) $gold,
            'silver' => (int) ($profile ? $profile->stars_silver : 0),
            'bronze' => (int) ($profile ? $profile->stars_bronze : 0),
            'next_gold' => (int) $nextLvlGold
        ];

        return response()->json([
            'active' => $myActive,
            'past' => $past,
            'userStats' => $userStats
        ]);
    }

    /**
     * Store a new challenge.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'max_participants' => 'required|integer|min:2|max:100',
            'difficulty' => 'required|integer|in:1,2,3',
            'num_questions' => 'required|integer|in:10,20,30,40',
            'duration' => 'required|integer', // minutes
            'end_at' => 'required|date|after:now',
            'file' => 'nullable|file|mimes:pdf,docx,txt,jpg,jpeg,png|max:10240',
            'language' => 'nullable|string|in:auto,ar,en',
        ]);

        $user = $request->user();
        if (!$user->can('access_challenges')) {
            return response()->json(['message' => 'هذه الميزة تتطلب صلاحيات المشتركين.'], 403);
        }
        
        // Extract text from file if provided
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
                $imageData = base64_encode(file_get_contents($filePath));
                $mimeType = $file->getMimeType();
                $text = "مرفق صورة للدراسة: data:{$mimeType};base64,{$imageData}";
            } else {
                $text = "ملف باسم " . $file->getClientOriginalName();
            }

            $text = mb_substr(trim($text), 0, 30000);
        }

        if (empty(trim($text))) {
            $subjectName = $request->subject_id ? Subject::find($request->subject_id)->name : $request->title;
            $text = "المادة: " . $subjectName . " (لم يتم رفع ملف أو تعذر استخراج النص، قم بتوليد أسئلة عامة بخصوص هذا التحدي)";
        }

        // Generate AI Quiz JSON
        $apiKey = SystemSetting::where('key', 'ai_test_api_key')->value('value');
        $model = SystemSetting::where('key', 'ai_test_model')->value('value') ?: 'gpt-4o';
        $baseUrl = SystemSetting::where('key', 'ai_api_base_url')->value('value');
        $promptTemplate = SystemSetting::where('key', 'ai_quiz_prompt')->value('value') ?: "قم بتوليد @count أسئلة بصعوبة @difficulty حول @subject.";
        
        $difficultyMap = [1 => 'سهل', 2 => 'متوسط', 3 => 'صعب'];
        $difficultyText = $difficultyMap[$request->difficulty];
        
        $prompt = str_replace(
            ['@count', '@difficulty', '@subject'],
            [$request->num_questions, $difficultyText, $request->title],
            $promptTemplate
        );

        // Language override
        $lang = $request->language ?? 'auto';
        if ($lang === 'ar') {
            $prompt .= "\n\nيجب أن يكون محتوى الاختبار (الأسئلة والخيارات) باللغة العربية الفصحى حصراً.";
        } elseif ($lang === 'en') {
            $prompt .= "\n\nThe quiz content (questions and options) must be exclusively in English.";
        }

        $prompt .= "\n\nالنص الدراسي:\n" . $text;

        $questionsJsonRaw = '[]';
        if ($apiKey) {
            try {
                if (Str::contains($model, 'gpt') || Str::contains($model, 'llama') || Str::contains($model, 'mixtral')) {
                    $endpoint = $baseUrl ?: (Str::contains($model, 'gpt') ? 'https://api.openai.com/v1/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions');
                    $response = Http::withToken($apiKey)->withOptions(['verify' => false])
                        ->post($endpoint, [
                            'model' => $model,
                            'messages' => [
                                ['role' => 'system', 'content' => $prompt],
                                ['role' => 'user', 'content' => 'قم بتوليد الاختبار الآن بصيغة JSON.']
                            ],
                            'response_format' => ['type' => 'json_object']
                        ]);
                    
                    if ($response->successful()) {
                        $questionsJsonRaw = $response->json()['choices'][0]['message']['content'];
                    }
                } else if (Str::contains($model, 'gemini')) {
                    $endpoint = $baseUrl ? rtrim($baseUrl, '/') . "/v1beta/models/{$model}:generateContent?key={$apiKey}" : "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
                    $response = Http::withOptions(['verify' => false])->post($endpoint, [
                        'contents' => [['parts' => [['text' => $prompt]]]],
                        'generationConfig' => ['response_mime_type' => 'application/json']
                    ]);
                    
                    if ($response->successful()) {
                        $questionsJsonRaw = $response->json()['candidates'][0]['content']['parts'][0]['text'];
                    }
                }
            } catch (\Exception $e) {
                Log::error('Challenge Quiz Generation Failed: ' . $e->getMessage());
            }
        }

        // Generate unique challenge code
        $code = 'CH-' . strtoupper(Str::random(4));
        while (Challenge::where('uuid', $code)->exists()) {
            $code = 'CH-' . strtoupper(Str::random(4));
        }

        DB::beginTransaction();
        try {
            $challenge = Challenge::create([
                'uuid' => $code,
                'title' => $request->title,
                'subject_id' => $request->subject_id,
                'created_by' => $user->id,
                'status' => 1,
                'max_participants' => $request->max_participants,
                'difficulty' => $request->difficulty,
                'num_questions' => $request->num_questions,
                'start_at' => now(),
                'end_at' => $request->end_at,
            ]);

            $challenge->participants()->attach($user->id, ['joined_at' => now(), 'status' => 0]);

            // Save Quiz Relationally
            $questionsArr = json_decode($questionsJsonRaw, true) ?: [];
            
            // Handle wrapper nesting from AI
            if (!isset($questionsArr[0]) && !empty($questionsArr)) {
                if (isset($questionsArr['questions'])) $questionsArr = $questionsArr['questions'];
                else if (isset($questionsArr['أسئلة'])) $questionsArr = $questionsArr['أسئلة'];
                else if (isset($questionsArr['اختبار']['أسئلة'])) $questionsArr = $questionsArr['اختبار']['أسئلة'];
                else {
                    foreach ($questionsArr as $val) {
                        if (is_array($val) && isset($val[0])) { $questionsArr = $val; break; }
                    }
                }
            }

            $quiz = Quiz::create([
                'uuid' => (string) Str::uuid(),
                'user_id' => $user->id,
                'subject_id' => $request->subject_id,
                'subject_name' => $request->subject_id ? Subject::find($request->subject_id)->name : $request->title,
                'source_file_name' => $request->hasFile('file') ? $request->file('file')->getClientOriginalName() : null,
                'num_questions' => count($questionsArr) ?: $request->num_questions,
                'time_limit' => $request->duration,
                'difficulty' => $request->difficulty,
                'is_challenge_quiz' => true,
                'challenge_id' => $challenge->id
            ]);

            $challenge->update(['quiz_id' => $quiz->id]);

            // Save Questions
            foreach ($questionsArr as $index => $qData) {
                $qText = $qData['question'] ?? $qData['سؤال'] ?? $qData['السؤال'] ?? "سؤال غير معروف؟";
                $type = (isset($qData['type']) && $qData['type'] === 'true_false') || (isset($qData['نوع']) && $qData['نوع'] === 'صح/خطأ') ? 2 : 1;
                $explanation = $qData['explanation'] ?? $qData['شرح'] ?? $qData['التفسير'] ?? null;
                $correctAns = $qData['correct'] ?? $qData['answer'] ?? $qData['إجابة'] ?? 0;

                $questionModel = QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question_text' => $qText,
                    'question_type' => $type,
                    'correct_answer' => is_bool($correctAns) || $type === 2 ? ($correctAns ? "true" : "false") : null,
                    'explanation' => $explanation,
                    'display_order' => $index + 1
                ]);

                if ($type === 1) { // MCQ
                    $opts = $qData['options'] ?? $qData['opts'] ?? $qData['choices'] ?? $qData['خيارات'] ?? [];
                    
                    // Map string answer to opt index
                    if (is_string($correctAns) && !is_numeric($correctAns)) {
                        $foundIdx = array_search($correctAns, $opts);
                        if ($foundIdx !== false) $correctAns = $foundIdx;
                    }

                    foreach ($opts as $optIdx => $optText) {
                        QuestionOption::create([
                            'question_id' => $questionModel->id,
                            'option_text' => $optText,
                            'is_correct' => (string)$optIdx === (string)$correctAns,
                            'display_order' => $optIdx + 1
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'تم إنشاء التحدي بنجاح',
                'challenge' => $challenge,
                'code' => $code
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed challenge DB creation: " . $e->getMessage());
            return response()->json(['message' => 'حدث خطأ أثناء إنشاء التحدي', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Join a challenge via code.
     */
    public function join(Request $request)
    {
        $user = $request->user();
        if (!$user->can('access_challenges')) {
            return response()->json(['message' => 'هذه الميزة تتطلب صلاحيات المشتركين.'], 403);
        }

        $request->validate([
            'code' => 'required|string',
        ]);

        $challenge = Challenge::where('uuid', strtoupper($request->code))
            ->where('status', 1) // Active
            ->first();

        if (!$challenge) {
            return response()->json(['message' => 'الكود غير صحيح أو التحدي منتهي.'], 404);
        }

        $user = $request->user();

        // Check if already joined
        if ($challenge->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'لقد انضممت بالفعل لهذا التحدي.', 'challenge' => $challenge], 200);
        }

        // Check capacity
        if ($challenge->participants()->count() >= $challenge->max_participants) {
            return response()->json(['message' => 'عذراً، التحدي وصل للحد الأقصى من المشاركين.'], 403);
        }

        $challenge->participants()->attach($user->id, ['joined_at' => now(), 'status' => 0, 'score' => 0, 'progress' => 0]);

        $participantsCount = $challenge->participants()->count();
        $challenge->load('subject');

        return response()->json([
            'message' => 'تم الانضمام بنجاح',
            'challenge' => [
                'id'               => $challenge->id,
                'uuid'             => $challenge->uuid,
                'title'            => $challenge->title,
                'subject'          => $challenge->subject ? $challenge->subject->name : 'عام',
                'participants_count'=> $participantsCount,
                'max_participants'  => $challenge->max_participants,
                'difficulty'       => $challenge->difficulty,
                'end_at'           => $challenge->end_at,
                'created_at'       => $challenge->created_at,
                'status'           => $challenge->status,
            ]
        ]);
    }

    /**
     * Get challenge details and quiz for playing.
     */
    public function show(Request $request, $uuid)
    {
        if (!$request->user()->can('access_challenges')) {
            return response()->json(['message' => 'هذه الميزة تتطلب صلاحيات المشتركين.'], 403);
        }

        $challenge = Challenge::where('uuid', $uuid)
            ->with(['quiz.questions.options', 'participants' => function($q) {
                // Order participants by score
                $q->with('profile')->orderByPivot('score', 'desc');
            }])
            ->firstOrFail();

        // Ensure user is participant or creator
        if ($challenge->created_by !== $request->user()->id && !$challenge->participants()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'غير مصرح لك بالوصول لهذا التحدي.'], 403);
        }

        // Format participants to match frontend expectation
        $formattedParticipants = $challenge->participants->map(function($p) use ($request) {
            return [
                'name' => $p->id === $request->user()->id ? 'أنت' : $p->name,
                'score' => $p->pivot->score ?? 0,
                'progress' => $p->pivot->progress ?? 0,
                'status' => $p->pivot->status ?? 0,
                'time_spent' => $p->pivot->time_spent ?? 0,
                'correct_count' => $p->pivot->correct_count ?? 0,
                'answers_json' => $p->pivot->answers_json ? json_decode($p->pivot->answers_json, true) : null,
                'current' => $p->id === $request->user()->id,
                'id' => $p->id
            ];
        });

        // Format questions
        $questions = [];
        if ($challenge->quiz && $challenge->quiz->questions) {
            $questions = $challenge->quiz->questions->map(function($q) {
                $opts = $q->options->sortBy('display_order')->values();
                $correctIdx = $opts->search(fn($o) => $o->is_correct);
                
                // For T/F fallback
                if ($opts->isEmpty() && $q->correct_answer !== null) {
                    $optArr = ['صح', 'خطأ'];
                    $cIdx = $q->correct_answer === 'true' ? 0 : 1;
                    return [
                        'q' => $q->question_text,
                        'opts' => $optArr,
                        'correct' => $cIdx,
                        'type' => $q->question_type
                    ];
                }

                return [
                    'q' => $q->question_text,
                    'opts' => $opts->pluck('option_text')->toArray(),
                    'correct' => $correctIdx !== false ? $correctIdx : 0,
                    'type' => $q->question_type
                ];
            })->toArray();
        }

        $challenge->setRelation('participants', collect($formattedParticipants));
        $challenge->participants_count = count($formattedParticipants);

        return response()->json([
            'challenge' => $challenge,
            'questions' => $questions,
            'participants' => $formattedParticipants,
            'settings' => [
                'speed_bonus_bronze' => \App\Models\SystemSetting::where('key', 'challenge_speed_bonus_bronze')->value('value') ?? 10,
                'combo_bonus_bronze' => \App\Models\SystemSetting::where('key', 'challenge_combo_bonus_bronze')->value('value') ?? 2
            ]
        ]);
    }

    /**
     * Sync progress for Live Leaderboard.
     */
    public function syncProgress(Request $request, $uuid)
    {
        $request->validate([
            'score' => 'required|numeric',
            'progress' => 'required|integer',
            'status' => 'nullable|integer',
            'time_spent' => 'nullable|integer',
            'correct_count' => 'nullable|integer',
            'answers_json' => 'nullable|array'
        ]);

        $challenge = Challenge::where('uuid', $uuid)->firstOrFail();
        $user = $request->user();

        // Update pivot
        $updateData = [
            'score' => $request->score,
            'progress' => $request->progress
        ];

        if ($request->has('status')) $updateData['status'] = $request->status;
        if ($request->has('time_spent')) $updateData['time_spent'] = $request->time_spent;
        if ($request->has('correct_count')) $updateData['correct_count'] = $request->correct_count;
        if ($request->has('answers_json')) $updateData['answers_json'] = json_encode($request->answers_json, JSON_UNESCAPED_UNICODE);

        $pivot = $challenge->participants()->where('user_id', $user->id)->first()->pivot;
        $wasCompleted = $pivot->status == 1;

        $challenge->participants()->updateExistingPivot($user->id, $updateData);

        if (isset($updateData['status']) && $updateData['status'] == 1 && !$wasCompleted) {
            // Gamification Auto-Conversion Logic
            $profile = $user->profile;
            if ($profile) {
                // Add score (which is now Stars/Points) to bronze balance
                $profile->stars_bronze += $request->score;
                
                $bronzeToSilver = \App\Models\SystemSetting::where('key', 'challenge_bronze_to_silver')->value('value') ?? 50;
                $silverToGold = \App\Models\SystemSetting::where('key', 'challenge_silver_to_gold')->value('value') ?? 10;
                
                // Bronze to Silver
                if ($profile->stars_bronze >= $bronzeToSilver && $bronzeToSilver > 0) {
                    $newSilvers = floor($profile->stars_bronze / $bronzeToSilver);
                    $profile->stars_silver += $newSilvers;
                    $profile->stars_bronze = $profile->stars_bronze % $bronzeToSilver;
                }
                
                // Silver to Gold
                if ($profile->stars_silver >= $silverToGold && $silverToGold > 0) {
                    $newGolds = floor($profile->stars_silver / $silverToGold);
                    $profile->stars_gold += $newGolds;
                    $profile->stars_silver = $profile->stars_silver % $silverToGold;
                }
                
                $profile->save();
            }
        }

        // Get updated leaderboard
        $participants = $challenge->participants()
            ->with('profile')
            ->orderByPivot('score', 'desc')
            ->get()
            ->map(function($p) use ($user) {
                return [
                    'name' => $p->id === $user->id ? 'أنت' : $p->name,
                    'score' => $p->pivot->score,
                    'progress' => $p->pivot->progress,
                    'status' => $p->pivot->status,
                    'time_spent' => $p->pivot->time_spent,
                    'correct_count' => $p->pivot->correct_count,
                    'current' => $p->id === $user->id,
                    'id' => $p->id
                ];
            });

        return response()->json([
            'participants' => $participants
        ]);
    }

    public function endChallenge(Request $request, $uuid)
    {
        $challenge = Challenge::where('uuid', $uuid)->where('created_by', $request->user()->id)->firstOrFail();
        $challenge->status = 2; // ended
        $challenge->save();
        return response()->json(['message' => 'تم إنهاء التحدي']);
    }

    public function destroy(Request $request, $uuid)
    {
        $challenge = Challenge::where('uuid', $uuid)->where('created_by', $request->user()->id)->firstOrFail();
        $challenge->delete();
        return response()->json(['message' => 'تم حذف التحدي نهائياً']);
    }

    public function kickParticipant(Request $request, $uuid, $userId)
    {
        $challenge = Challenge::where('uuid', $uuid)->where('created_by', $request->user()->id)->firstOrFail();
        // Since we allow kick, just detach from pivot table
        $challenge->participants()->detach($userId);
        return response()->json(['message' => 'تم طرد المشارك بنجاح']);
    }
}
