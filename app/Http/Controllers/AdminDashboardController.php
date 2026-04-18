<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserSubscription;
use App\Models\Resource;
use App\Models\Report;
use App\Models\University;
use App\Models\College;
use App\Models\Major;
use App\Models\Subject;
use App\Models\AuditLog;
use App\Models\Suggestion;
use App\Models\Challenge;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // KPIs
        $stats = [
            'users' => [
                'total' => User::count(),
                'delta' => '+0%', // Placeholder for now
                'trend' => 'up'
            ],
            'subscriptions' => [
                'total' => UserSubscription::where('status', 1)->count(),
                'delta' => '+0%',
                'trend' => 'up'
            ],
            'resources' => [
                'total' => Resource::where('is_approved', 1)->count(),
                'delta' => '+0%',
                'trend' => 'up'
            ],
            'reports' => [
                'total' => Report::where('status', 0)->count(),
                'delta' => '-0%',
                'trend' => 'down'
            ]
        ];

        // Academic Stats
        $academic = [
            'universities' => University::count(),
            'colleges' => College::count(),
            'majors' => Major::count(),
            'subjects' => Subject::count()
        ];

        // Social Stats
        $social = [
            'suggestions' => Suggestion::where('status', 0)->count(),
            'challenges' => Challenge::where('status', 'active')->count()
        ];

        // Recent Activity
        $activity = AuditLog::with('user.profile')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'النظام',
                    'action' => $this->formatAction($log),
                    'target' => $log->metadata['title'] ?? ($log->auditable_type ? class_basename($log->auditable_type) : ''),
                    'time' => $log->created_at->diffForHumans(),
                    'type' => $log->action,
                    'auditable_type' => $log->auditable_type ? class_basename($log->auditable_type) : null
                ];
            });

        // Recent Users
        $recentUsers = User::with('profile')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($u) {
                return [
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'status' => $u->status == 1 ? 'active' : 'banned',
                    'date' => $u->created_at->diffForHumans()
                ];
            });

        return response()->json([
            'stats' => $stats,
            'academic' => $academic,
            'social' => $social,
            'activity' => $activity,
            'recentUsers' => $recentUsers
        ]);
    }

    private function formatAction($log)
    {
        $action = $log->action;
        switch ($action) {
            case 'created': return 'قام بإضافة';
            case 'updated': return 'قام بتعديل';
            case 'deleted': return 'قام بحذف';
            case 'approved': return 'قام باعتماد';
            case 'unapproved': return 'ألغى اعتماد';
            case 'login': return 'سجل دخوله';
            case 'logout': return 'سجل خروجه';
            case 'failed_login': return 'حاول الدخول وفشل';
            default: return $action;
        }
    }
}
