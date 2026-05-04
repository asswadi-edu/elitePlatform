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

        // Current term settings
        $currSemester = SystemSetting::where('key', 'current_semester')->value('value') ?? 1;
        $currLevel    = $user->universityInfo->study_level ?? 1;

        // IDs enrolled in the CURRENT semester
        $currentTermIds = StudentSubject::where('user_id', $user->id)
            ->where('study_level', $currLevel)
            ->where('semester', $currSemester)
            ->pluck('subject_id')
            ->toArray();

        // IDs enrolled in PREVIOUS terms/levels (strictly excluding current term)
        $previousEnrolledIds = StudentSubject::where('user_id', $user->id)
            ->where(function($q) use ($currLevel, $currSemester) {
                $q->where('study_level', '<', $currLevel)
                  ->orWhere(function($sq) use ($currLevel, $currSemester) {
                      $sq->where('study_level', $currLevel)
                        ->where('semester', '<', $currSemester);
                  });
            })
            ->pluck('subject_id')
            ->toArray();

        $subjects = Subject::where('major_id', $majorId)
            ->where('is_active', true)
            ->get()
            ->map(function ($s) use ($previousEnrolledIds, $currentTermIds) {
                return [
                    'id'               => $s->id,
                    'name'             => $s->name,
                    'code'             => $s->code,
                    'is_free'          => $s->is_free,
                    'credit_hours'     => $s->credit_hours,
                    // If studied in previous term, it's IMMUTABLE
                    'already_enrolled' => in_array($s->id, $previousEnrolledIds),
                    // If in current term, it's TOGGLEABLE
                    'in_current_term'  => in_array($s->id, $currentTermIds),
                ];
            });

        return response()->json([
            'subjects'        => $subjects,
            'current_term_ids' => $currentTermIds,
        ]);
    }

    /**
     * Enroll in subjects for the current term (Sync logic).
     */
    public function enrollSubjects(Request $request)
    {
        $request->validate([
            'subject_ids' => 'present|array', // present allows empty array to clear term
            'subject_ids.*' => 'exists:subjects,id'
        ]);

        $user = $request->user();
        
        $currSemester = SystemSetting::where('key', 'current_semester')->first()->value ?? 1;
        $currYear = SystemSetting::where('key', 'current_academic_year')->first()->value ?? date('Y') . '/' . (date('Y') + 1);
        $currLevel = $user->universityInfo->study_level ?? 1;

        $incomingIds = $request->subject_ids;
        $subjects = Subject::whereIn('id', $incomingIds)->get();

        // 1. Subscription Validation
        if (!$user->can('manage_paid_subjects')) {
            foreach ($subjects as $s) {
                if (!$s->is_free) {
                    return response()->json(['message' => 'المواد التخصصية تتطلب اشتراكاً'], 403);
                }
            }
        }

        // 2. Max Subjects Validation
        $maxSubjects = (int)SystemSetting::where('key', 'max_semester_subjects')->first()->value ?? 12;
        if (count($incomingIds) > $maxSubjects) {
            return response()->json(['message' => "لا يمكنك اختيار أكثر من {$maxSubjects} مادة للترم الواحد."], 400);
        }

        return DB::transaction(function () use ($user, $incomingIds, $currLevel, $currSemester, $currYear) {
            // Delete subjects from current term that are NOT in the incoming list
            StudentSubject::where('user_id', $user->id)
                ->where('study_level', $currLevel)
                ->where('semester', $currSemester)
                ->whereNotIn('subject_id', $incomingIds)
                ->delete();

            $added = 0;
            foreach ($incomingIds as $id) {
                // Check if already exists in CURRENT term
                $inTerm = StudentSubject::where('user_id', $user->id)
                    ->where('study_level', $currLevel)
                    ->where('semester', $currSemester)
                    ->where('subject_id', $id)
                    ->exists();

                if (!$inTerm) {
                    // Check if studied in PREVIOUS terms (prevent re-taking)
                    $studiedBefore = StudentSubject::where('user_id', $user->id)
                        ->where('subject_id', $id)
                        ->exists();

                    if (!$studiedBefore) {
                        StudentSubject::create([
                            'user_id' => $user->id,
                            'subject_id' => $id,
                            'study_level' => $currLevel,
                            'semester' => $currSemester,
                            'academic_year' => $currYear
                        ]);
                        $added++;
                    }
                }
            }

            return response()->json(['message' => 'تم تحديث مواد الترم بنجاح', 'added' => $added]);
        });
    }
}
