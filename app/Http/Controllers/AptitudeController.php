<?php

namespace App\Http\Controllers;

use App\Models\AptitudeTest;
use App\Models\AptitudeQuestion;
use Illuminate\Http\Request;

class AptitudeController extends Controller
{
    /**
     * Get active test and its questions.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->can('take_aptitude_test')) {
            return response()->json(['message' => 'غير مصرح لك بإجراء هذا الاختبار.'], 403);
        }
        $maxAttempts = (int) (\App\Models\SystemSetting::where('key', 'aptitude_max_attempts')->value('value') ?? 1);
        $userAttemptsCount = \App\Models\UserAptitudeAttempt::where('user_id', $user->id)->where('status', 1)->count();
        
        if ($userAttemptsCount >= $maxAttempts) {
            $pastResults = \App\Models\UserAptitudeAttempt::where('user_id', $user->id)
                ->where('status', 1)
                ->with(['result', 'result.field']) // load related models
                ->orderBy('created_at', 'desc')
                ->get();
            
            $canDeleteResults = (bool) (\App\Models\SystemSetting::where('key', 'aptitude_can_delete_results')->value('value') ?? true);
            
            return response()->json([
                'has_taken_test' => true,
                'max_attempts' => $maxAttempts,
                'attempts_count' => $userAttemptsCount,
                'past_results' => $pastResults,
                'can_delete_results' => $canDeleteResults
            ]);
        }

        $test = AptitudeTest::where('is_active', true)->first();
        
        if (!$test) {
            return response()->json(['message' => 'No active test found'], 404);
        }

        // إرجاع الأسئلة بشكل عشوائي لمنع حفظ الترتيب واكتشاف الأنماط
        // الفراونت اند سيستخدم attribute 'display_order' لتعيين المفتاح q1 ... q30 قبل الإرسال
        $questions = AptitudeQuestion::where('test_id', $test->id)
            ->inRandomOrder()
            ->get();

        return response()->json([
            'has_taken_test' => false,
            'max_attempts' => $maxAttempts,
            'attempts_count' => $userAttemptsCount,
            'test' => $test,
            'questions' => $questions
        ]);
    }

    /**
     * Submit answers directly to Python ML model, save them, and link to DB majors.
     */
    public function predict(Request $request)
    {
        // 1. Validation: التأكد من وجود 30 حقلاً (من q1 إلى q30) وأن قيمها بين 1 و 5
        $rules = [];
        for ($i = 1; $i <= 30; $i++) {
            $rules["q{$i}"] = 'required|integer|between:1,5';
        }
        $validatedData = $request->validate($rules);

        $user = $request->user();
        if (!$user->can('take_aptitude_test')) {
            return response()->json(['message' => 'غير مصرح لك بإجراء هذا الاختبار.'], 403);
        }
        $maxAttempts = (int) (\App\Models\SystemSetting::where('key', 'aptitude_max_attempts')->value('value') ?? 1);
        $userAttemptsCount = \App\Models\UserAptitudeAttempt::where('user_id', $user->id)->where('status', 1)->count();

        if ($userAttemptsCount >= $maxAttempts) {
            return response()->json(['message' => 'لقد استنفذت عدد المحاولات المتاحة.'], 403);
        }

        $test = AptitudeTest::where('is_active', true)->firstOrFail();

        try {
            // Use PYTHON_API_URL env variable (falls back to localhost for development)
            $pythonApiUrl = rtrim(env('PYTHON_API_URL', 'http://127.0.0.1:8001'), '/');

            // Timeout is 120s to handle Render free tier cold start (can take up to 7 min on first request)
            $response = \Illuminate\Support\Facades\Http::timeout(120)
                ->retry(2, 5000) // retry twice with 5 second delay
                ->post("{$pythonApiUrl}/predict", $validatedData);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'حدث خطأ أثناء التواصل مع محرك الذكاء الاصطناعي.',
                    'error' => $response->body()
                ], $response->status());
            }

            $mlResult = $response->json();
            $predictedField = $mlResult['predicted_field'] ?? '';
            $confidence = $mlResult['confidence_score'] ?? '0';
            
            // تحويل نسبة الثقة لرقم للحفظ في قاعدة البيانات
            $matchPercentage = intval(str_replace('%', '', $confidence));

            // إنشاء محاولة الطالب
            $attempt = \App\Models\UserAptitudeAttempt::create([
                'user_id' => $user->id,
                'test_id' => $test->id,
                'status' => 1,
                'time_taken' => $request->time_taken ?? 0,
                'finished_at' => now(),
            ]);

            // حفظ تفاصيل الإجابات 
            $questions = AptitudeQuestion::where('test_id', $test->id)->get();
            foreach ($questions as $q) {
                // الفرونت اند يرسل البيانات مرتبة بالمفاتيح q1..q30 بناء على display_order الأصلي
                $qKey = "q" . $q->display_order;
                if (isset($validatedData[$qKey])) {
                    \App\Models\UserAptitudeAnswer::create([
                        'attempt_id' => $attempt->id,
                        'question_id' => $q->id,
                        'answer_value' => $validatedData[$qKey]
                    ]);
                }
            }

            // ربط النتيجة بمجالات المنصة لاستخراج التخصصات المرتبطة
            $field = \App\Models\Field::where('name', $predictedField)->first();
            $fieldId = $field ? $field->id : null;
            
            $suggestedMajors = [];
            if ($field) {
                $majors = \App\Models\Major::where('field_id', $field->id)->take(6)->get();
                $suggestedMajors = $majors->map(function ($m) use ($matchPercentage) {
                    return [
                        'major_id' => $m->id,
                        'name' => $m->name,
                        'score' => $matchPercentage // نسبة الملاءمة للمجال بشكل عام
                    ];
                });
            }

            $resultRecord = \App\Models\UserAptitudeResult::create([
                'attempt_id' => $attempt->id,
                'user_id' => $user->id,
                'best_field_name' => $predictedField,
                'best_field_id' => $fieldId,
                'match_percentage' => $matchPercentage,
                'suggested_majors' => $suggestedMajors,
                'raw_ml_response' => $mlResult,
            ]);

            return response()->json([
                'uuid' => $attempt->uuid,
                'result' => $resultRecord,
                'ml_response' => $mlResult
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'تعذر الاتصال بمحرك الذكاء الاصطناعي. الرجاء التأكد من تشغيل سيرفر بايثون.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get test result by uuid.
     */
    public function result($uuid)
    {
        $attempt = \App\Models\UserAptitudeAttempt::where('uuid', $uuid)
            ->with(['result', 'test'])
            ->firstOrFail();

        $canDeleteResults = (bool) (\App\Models\SystemSetting::where('key', 'aptitude_can_delete_results')->value('value') ?? true);

        return response()->json([
            'attempt' => $attempt,
            'result' => $attempt->result,
            'can_delete_results' => $canDeleteResults
        ]);
    }

    /**
     * Delete an aptitude test attempt.
     */
    public function destroy($uuid)
    {
        $canDeleteResults = (bool) (\App\Models\SystemSetting::where('key', 'aptitude_can_delete_results')->value('value') ?? true);
        
        if (!$canDeleteResults) {
            return response()->json(['message' => 'عذراً، ميزة حذف النتائج غير مفعلة حالياً.'], 403);
        }

        $attempt = \App\Models\UserAptitudeAttempt::where('uuid', $uuid)->firstOrFail();

        // Check ownership
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'غير مصرح لك بحذف هذه النتيجة.'], 403);
        }

        // Delete dependencies first (UserAptitudeAnswer and UserAptitudeResult)
        \App\Models\UserAptitudeAnswer::where('attempt_id', $attempt->id)->delete();
        \App\Models\UserAptitudeResult::where('attempt_id', $attempt->id)->delete();
        $attempt->delete();

        return response()->json(['message' => 'تم حذف النتيجة بنجاح. يمكنك الآن إعادة إجراء الاختبار.']);
    }
}
