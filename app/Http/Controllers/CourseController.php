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
     * Get subjects available for the student's major.
     */
    public function getAvailableCourses(Request $request)
    {
        $user = $request->user();
        $majorId = $user->universityInfo->major_id ?? null;

        if (!$majorId) {
            return response()->json(['message' => 'Please set your major first'], 400);
        }

        $subjects = Subject::where('major_id', $majorId)
            ->where('is_active', true)
            ->get();

        return response()->json($subjects);
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
        if (count($subjectIds) > $maxSubjects) {
            return response()->json(['message' => "لا يمكنك اختيار أكثر من {$maxSubjects} مادة للترم الواحد."], 400);
        }

        return DB::transaction(function () use ($user, $subjectIds, $currLevel, $currSemester, $currYear) {
            // Remove old enrollments for the SAME term if they want to override
            StudentSubject::where('user_id', $user->id)
                ->where('study_level', $currLevel)
                ->where('semester', $currSemester)
                ->delete();

            foreach ($subjectIds as $id) {
                StudentSubject::create([
                    'user_id' => $user->id,
                    'subject_id' => $id,
                    'study_level' => $currLevel,
                    'semester' => $currSemester,
                    'academic_year' => $currYear
                ]);
            }

            return response()->json(['message' => 'Enrolled successfully']);
        });
    }
}
