<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\StudentSubject;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * Get subjects current student is enrolled in, grouped by level/semester.
     */
    public function getMyCourses(Request $request)
    {
        $user = $request->user();
        $enrolled = StudentSubject::where('user_id', $user->id)
            ->with('subject')
            ->get()
            ->groupBy(function($item) {
                return $item->study_level . '-' . $item->semester;
            });

        $formatted = [];
        foreach ($enrolled as $key => $items) {
            $formatted[] = [
                'level' => $items[0]->study_level,
                'semester' => $items[0]->semester,
                'academic_year' => $items[0]->academic_year,
                'subjects' => $items->pluck('subject')
            ];
        }

        return response()->json($formatted);
    }

    /**
     * Get subjects available for the student's major,
     * including flags for already-enrolled and current-semester subjects.
     */
    public function getAvailableCourses(Request $request)
    {
        $user = $request->user();
        $majorId = $user->universityInfo->major_id ?? null;

        if (!$majorId) {
            return response()->json(['message' => 'Please set your major first'], 400);
        }

        // IDs enrolled in ANY previous term (should be disabled – can't re-add)
        $allEnrolledIds = StudentSubject::where('user_id', $user->id)
            ->pluck('subject_id')
            ->toArray();

        // IDs enrolled in the CURRENT semester (already added this term)
        $currSemester = SystemSetting::where('key', 'current_semester')->value('value') ?? 1;
        $currLevel    = $user->universityInfo->study_level ?? 1;
        $currentTermIds = StudentSubject::where('user_id', $user->id)
            ->where('study_level', $currLevel)
            ->where('semester', $currSemester)
            ->pluck('subject_id')
            ->toArray();

        $subjects = Subject::where('major_id', $majorId)
            ->where('is_active', true)
            ->get()
            ->map(function ($s) use ($allEnrolledIds, $currentTermIds) {
                return [
                    'id'               => $s->id,
                    'name'             => $s->name,
                    'code'             => $s->code,
                    'is_free'          => $s->is_free,
                    'credit_hours'     => $s->credit_hours,
                    'already_enrolled' => in_array($s->id, $allEnrolledIds),   // disable
                    'in_current_term'  => in_array($s->id, $currentTermIds),   // pre-checked
                ];
            });

        return response()->json([
            'subjects'        => $subjects,
            'current_term_ids' => $currentTermIds,
        ]);
    }

    /**
     * Enroll in subjects for the current term.
     */
    public function enrollSubjects(Request $request)
    {
        $request->validate([
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id'
        ]);

        $user = $request->user();
        
        // Fetch Current term settings
        $currSemester = SystemSetting::where('key', 'current_semester')->first()->value ?? 1;
        $currYear = SystemSetting::where('key', 'current_academic_year')->first()->value ?? date('Y') . '/' . (date('Y') + 1);
        $currLevel = $user->universityInfo->study_level ?? 1;

        $subjectIds = $request->subject_ids;
        $subjects = Subject::whereIn('id', $subjectIds)->get();

        // VALIDATION
        if (!$user->can('manage_paid_subjects')) {
            foreach ($subjects as $s) {
                if (!$s->is_free) {
                    return response()->json(['message' => 'المواد التخصصية تتطلب اشتراكاً'], 403);
                }
            }
        }

        $maxSubjects = (int)SystemSetting::where('key', 'max_semester_subjects')->first()->value ?? 12;
        $currentCount = StudentSubject::where('user_id', $user->id)
            ->where('study_level', $currLevel)
            ->where('semester', $currSemester)
            ->count();

        if (($currentCount + count($subjectIds)) > $maxSubjects) {
            return response()->json(['message' => "لا يمكنك اختيار أكثر من {$maxSubjects} مادة للترم الواحد. لديك حالياً {$currentCount} مواد."], 400);
        }

        return DB::transaction(function () use ($user, $subjectIds, $currLevel, $currSemester, $currYear) {
            $addedCount = 0;
            $skippedCount = 0;

            foreach ($subjectIds as $id) {
                // Check if subject was ALREADY added in ANY term (as per user request: "لا تنضاف مرة اخرى")
                $exists = StudentSubject::where('user_id', $user->id)
                    ->where('subject_id', $id)
                    ->exists();

                if (!$exists) {
                    StudentSubject::create([
                        'user_id' => $user->id,
                        'subject_id' => $id,
                        'study_level' => $currLevel,
                        'semester' => $currSemester,
                        'academic_year' => $currYear
                    ]);
                    $addedCount++;
                } else {
                    $skippedCount++;
                }
            }

            return response()->json([
                'message' => 'تمت عملية إضافة المواد بنجاح',
                'added' => $addedCount,
                'skipped' => $skippedCount
            ]);
        });
    }
}
