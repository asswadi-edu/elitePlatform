<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with(['user.profile', 'targetUser.profile'])->orderBy('created_at', 'desc');

        // If not admin, only show own logs
        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        } elseif ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('type') && $request->type !== 'all') {
            // Map frontend types to auditable types or specific actions if needed
            // For now, let's just filter by simplified categories
            switch ($request->type) {
                case 'users':
                    $query->where('auditable_type', 'App\Models\User');
                    break;
                case 'content':
                    $query->whereIn('auditable_type', [
                        'App\Models\Resource', 
                        'App\Models\University', 
                        'App\Models\College', 
                        'App\Models\Major', 
                        'App\Models\Subject'
                    ]);
                    break;
                case 'finance':
                    $query->whereIn('auditable_type', [
                        'App\Models\SubscriptionPlan', 
                        'App\Models\ActivationCard', 
                        'App\Models\UserSubscription'
                    ]);
                    break;
                case 'security':
                    $query->whereIn('action', ['login', 'logout', 'failed_login', 'password_changed']);
                    break;
                case 'social':
                    $query->whereIn('auditable_type', [
                        'App\Models\PointRule',
                        'App\Models\UserPoints',
                        'App\Models\Notification'
                    ]);
                    break;
            }
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', "%$search%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%$search%")
                         ->orWhere('email', 'like', "%$search%");
                  });
            });
        }

        return response()->json($query->paginate(20));
    }
}
