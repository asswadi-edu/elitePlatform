<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AiQuiz;
use App\Models\AiQuizAttempt;
use App\Models\Resource;
use App\Models\StudentSubject;
use Illuminate\Support\Facades\DB;

class StudentDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $user->load('points', 'universityInfo');
        
        $quizzesCount = AiQuiz::where('user_id', $user->id)->count();
        $avgScore = AiQuizAttempt::where('user_id', $user->id)->avg('score') ?: 0;
        $resourcesCount = Resource::where('user_id', $user->id)->count();
        
        // Count resources that are links vs files? 
        // For now, let's just count total and maybe another metric
        $recentAttempts = AiQuizAttempt::where('user_id', $user->id)
            ->with('aiQuiz')
            ->latest()
            ->take(3)
            ->get();

        $enrolledSubjects = StudentSubject::where('user_id', $user->id)
            ->with('subject')
            ->where('study_level', $user->universityInfo->study_level ?? 0)
            ->where('semester', \App\Models\SystemSetting::where('key', 'current_semester')->value('value') ?? 1)
            ->take(4)
            ->get();

        return response()->json([
            'stats' => [
                'quizzes_count' => $quizzesCount,
                'avg_score' => round($avgScore, 1),
                'resources_count' => $resourcesCount,
                'points' => $user->points->balance ?? 0,
            ],
            'recent_attempts' => $recentAttempts,
            'my_subjects' => $enrolledSubjects->pluck('subject')
        ]);
    }
}
