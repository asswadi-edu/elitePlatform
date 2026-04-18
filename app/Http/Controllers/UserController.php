<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserPoints;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of the users for admin.
     */
    public function index()
    {
        $paginator = User::with(['profile', 'points', 'activeSubscription.plan', 'roles'])
            ->withCount(['resources' => function ($query) {
                $query->where('is_approved', true);
            }])
            ->paginate(20);

        $paginator->getCollection()->transform(function ($user) {
            $profile = $user->profile;
            $name = $profile ? "{$profile->first_name} {$profile->father_name} {$profile->grandfather_name} {$profile->last_name}" : 'User';
            
            // Sum dislikes
            $totalDislikes = $user->resources()->sum('dislikes_count');
            
            // Map status
            $statusStr = 'active';
            if ($user->status == 0) $statusStr = 'banned';
            if ($user->status == 2) $statusStr = 'pending';

            // Map subscription
            $activeSub = $user->activeSubscription;
            $sub = $activeSub ? ($activeSub->plan ? $activeSub->plan->name : 'خطة غير معروفة') : ($user->role === 'admin' || $user->role === 'moderator' ? 'إداري' : 'مجاني');

            return [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'name' => trim($name),
                'email' => $user->email,
                'role' => $user->roles->first() ? $user->roles->first()->name : 'user',
                'joined' => $user->created_at->format('Y/m/d'),
                'status' => $statusStr,
                'points' => $user->points ? $user->points->balance : 0,
                'resources' => $user->resources_count,
                'dislikes' => (int)$totalDislikes,
                'sub' => $sub,
                'is_trusted' => (bool)$user->is_trusted,
                'is_university' => (bool)$user->is_university,
                'is_super_admin' => $user->id === 1,
            ];
        });

        return response()->json($paginator);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|string|in:user,student,moderator,admin,vip',
            'first_name' => 'required|string|max:60',
            'father_name' => 'required|string|max:60',
            'grandfather_name' => 'required|string|max:60',
            'last_name' => 'required|string|max:60',
            'gender' => 'required|string|in:male,female',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'uuid' => (string) Str::uuid(),
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => 1, // active
                'is_university' => $request->role === 'student',
                'must_change_password' => true,
            ]);

            // RBAC assignment
            $roleName = $request->role;
            if ($roleName === 'user') $roleName = 'student_school'; // map 'user' to 'student' role
            if ($roleName === 'vip') $roleName = 'student_school'; // map 'vip' to 'student' role for now
            if ($roleName === 'student') $roleName = 'student_university';
            $user->assignRole($roleName);

            $genderMap = ['male' => 1, 'female' => 2];
            $gender = $genderMap[$request->gender] ?? null;

            UserProfile::create([
                'user_id' => $user->id,
                'first_name' => $request->first_name,
                'father_name' => $request->father_name,
                'grandfather_name' => $request->grandfather_name,
                'last_name' => $request->last_name,
                'gender' => $gender,
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ], 201);
        });
    }

    /**
     * Toggle user status (active/banned).
     */
    public function toggleStatus($id)
    {
        if ($id == 1) {
            return response()->json(['message' => 'Cannot modify Super Admin'], 403);
        }

        $user = User::findOrFail($id);
        $user->status = $user->status == 1 ? 0 : 1;
        $user->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'status' => $user->status == 1 ? 'active' : 'banned'
        ]);
    }

    /**
     * Change user role.
     */
    public function changeRole(Request $request, $id)
    {
        if ($id == 1) {
            return response()->json(['message' => 'Cannot modify Super Admin'], 403);
        }

        $request->validate(['role' => 'required|string|in:user,student,moderator,admin,vip']);

        $user = User::findOrFail($id);
        
        $roleName = $request->role;
        if ($roleName === 'user') $roleName = 'student_school';
        if ($roleName === 'vip') $roleName = 'student_school';
        if ($roleName === 'student') $roleName = 'student_university';

        $user->is_university = $roleName === 'student_university';
        $user->save();

        // RBAC sync
        $user->syncRoles([$roleName]);

        return response()->json(['message' => 'Role updated successfully']);
    }

    /**
     * Adjust user points.
     */
    public function adjustPoints(Request $request, $id)
    {
        if ($id == 1) {
            return response()->json(['message' => 'Cannot modify Super Admin'], 403);
        }

        $request->validate(['amount' => 'required|integer']);

        $points = UserPoints::firstOrCreate(
            ['user_id' => $id],
            ['balance' => 0, 'total_earned' => 0]
        );

        $points->balance = max(0, $points->balance + $request->amount);
        if ($request->amount > 0) {
            $points->total_earned += $request->amount;
        }
        $points->save();

        return response()->json([
            'message' => 'Points adjusted successfully',
            'balance' => $points->balance
        ]);
    }

    /**
     * Send notification to user.
     */
    public function notifyUser(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'title' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:50',
        ]);

        $user = User::findOrFail($id);

        $notification = \App\Models\Notification::create([
            'user_id' => $user->id,
            'type' => $request->type ?? 'admin_message',
            'data' => [
                'message' => $request->message,
                'title' => $request->title ?? 'تنبيه من الإدارة',
            ],
        ]);

        return response()->json([
            'message' => 'Notification sent successfully',
            'notification' => $notification
        ]);
    }

    /**
     * Toggle user trust status.
     */
    public function toggleTrust($id)
    {
        if ($id == 1) {
            return response()->json(['message' => 'Cannot modify Super Admin'], 403);
        }

        $user = User::findOrFail($id);
        $user->is_trusted = !$user->is_trusted;
        $user->save();

        return response()->json([
            'message' => 'Trust status updated successfully',
            'is_trusted' => (bool)$user->is_trusted
        ]);
    }
}
