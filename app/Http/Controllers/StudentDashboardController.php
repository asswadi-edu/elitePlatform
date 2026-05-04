<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AiQuiz;
use App\Models\AiQuizAttempt;
use App\Models\Resource;
use App\Models\StudentSubject;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;

class StudentDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $user->load([
            'points',
            'universityInfo.university',
            'universityInfo.college',
            'universityInfo.major',
            'activeSubscription.plan',
            'profile',
        ]);

        // ── Quiz stats ──────────────────────────────────────────────
        $quizzesCount  = AiQuiz::where('user_id', $user->id)->count();
        $avgScore      = AiQuizAttempt::where('user_id', $user->id)->avg('score') ?? 0;
        $resourcesCount = Resource::where('user_id', $user->id)->count();

        // ── Subscription & AI test quota ────────────────────────────
        $activeSub   = $user->activeSubscription;
        $plan        = $activeSub?->plan;
        $maxAiTests  = $plan?->max_ai_tests ?? 0;        // 0 = unlimited for some plans

        // Tests used this month (or total if plan has no period limit – adjust as needed)
        $usedThisMonth = AiQuiz::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // ── Recent quiz attempts ─────────────────────────────────────
        $recentAttempts = AiQuizAttempt::where('user_id', $user->id)
            ->with('aiQuiz')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id'         => $attempt->id,
                    'subject'    => $attempt->aiQuiz?->subject ?? '—',
                    'score'      => $attempt->score,
                    'total'      => $attempt->total ?? 0,
                    'percentage' => $attempt->total > 0
                        ? round(($attempt->score / $attempt->total) * 100)
                        : 0,
                    'taken_at'   => $attempt->created_at?->toDateTimeString(),
                ];
            });

        // ── Current-semester enrolled subjects ───────────────────────
        $currentSemester = SystemSetting::where('key', 'current_semester')->value('value') ?? 1;
        $studyLevel      = $user->universityInfo?->study_level ?? 0;

        $enrolledSubjects = StudentSubject::where('user_id', $user->id)
            ->with('subject')
            ->where('study_level', $studyLevel)
            ->where('semester', $currentSemester)
            ->take(6)
            ->get()
            ->map(fn($ss) => [
                'id'   => $ss->subject?->id,
                'name' => $ss->subject?->name,
                'code' => $ss->subject?->code,
            ]);

        // ── Best quiz score ──────────────────────────────────────────
        $bestScore = AiQuizAttempt::where('user_id', $user->id)->max('score') ?? 0;

        // ── Uploaded resources stats ─────────────────────────────────
        $approvedResources = Resource::where('user_id', $user->id)
            ->where('status', 1)
            ->count();

        $totalDownloads = Resource::where('user_id', $user->id)
            ->sum('downloads_count');

        $totalLikes = Resource::where('user_id', $user->id)
            ->sum('likes_count');

        return response()->json([
            'stats' => [
                'quizzes_count'      => $quizzesCount,
                'avg_score'          => round($avgScore, 1),
                'resources_count'    => $resourcesCount,
                'approved_resources' => $approvedResources,
                'total_downloads'    => (int) $totalDownloads,
                'total_likes'        => (int) $totalLikes,
                'points'             => (int) ($user->points?->balance ?? 0),
                'best_score'         => (int) $bestScore,
            ],
            'subscription' => [
                'is_active'       => $activeSub !== null,
                'plan_name'       => $plan?->name ?? null,
                'plan_color'      => $plan?->color_hex ?? '#3B5BDB',
                'ends_at'         => $activeSub?->ends_at?->toDateString(),
                'days_remaining'  => $activeSub
                    ? max(0, now()->diffInDays($activeSub->ends_at, false))
                    : 0,
                'max_ai_tests'    => $maxAiTests,
                'used_this_month' => $usedThisMonth,
                'quizzes_left'    => $maxAiTests > 0
                    ? max(0, $maxAiTests - $usedThisMonth)
                    : null,           // null = unlimited
            ],
            'university_info' => [
                'university'   => $user->universityInfo?->university?->name,
                'college'      => $user->universityInfo?->college?->name,
                'major'        => $user->universityInfo?->major?->name,
                'study_level'  => $user->universityInfo?->study_level,
                'academic_number' => $user->universityInfo?->academic_number,
                'semester'     => (int) $currentSemester,
            ],
            'recent_attempts' => $recentAttempts,
            'my_subjects'     => $enrolledSubjects,
            'notifications_count' => $user->notifications()->where('is_read', 0)->count(),
        ]);
    }
}
