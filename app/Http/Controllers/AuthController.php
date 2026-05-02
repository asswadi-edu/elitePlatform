<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\UniversityStudentInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\AuditLog;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Verified;
use App\Models\VerificationCode;
use App\Mail\EmailVerificationCode;
use App\Mail\PasswordResetCode;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;



class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:50',
            'father_name' => 'required|string|max:50',
            'grandfather_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'is_university' => 'required|boolean',
            'gender' => 'required|string|in:male,female',
            'birth_date' => 'required|date|before:today',
            'university_id' => 'required_if:is_university,true|nullable|exists:universities,id',
            'college_id' => 'required_if:is_university,true|nullable|exists:colleges,id',
            'major_id' => 'required_if:is_university,true|nullable|exists:majors,id',
        ]);

        try {
            $otp = VerificationCode::generateFor($request->email, 'email_verification');
            Mail::to($request->email)->send(new EmailVerificationCode($otp->code));
            
            // Store registration data in Cache for 15 minutes
            Cache::put('pending_reg_' . $request->email, $request->all(), 900);

            return response()->json([
                'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function finalizeRegistration(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'code' => 'required|string|size:6',
        ]);

        $entry = VerificationCode::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', 'email_verification')
            ->where('expires_at', '>', now())
            ->first();

        if (!$entry) {
            return response()->json(['message' => 'الرمز غير صحيح أو انتهت صلاحيته.'], 422);
        }

        $formData = Cache::get('pending_reg_' . $request->email);
        if (!$formData) {
            return response()->json(['message' => 'انتهت صلاحية الجلسة، يرجى إعادة ملء نموذج التسجيل.'], 422);
        }

        return DB::transaction(function () use ($formData, $entry) {
            $user = User::create([
                'uuid' => (string) Str::uuid(),
                'email' => $formData['email'],
                'password' => Hash::make($formData['password']),
                'is_university' => $formData['is_university'],
                'email_verified_at' => now(),
            ]);

            $user->assignRole($formData['is_university'] ? 'student_university' : 'student_school');

            $genderMap = ['male' => 1, 'female' => 2];
            $gender = $genderMap[$formData['gender']] ?? null;

            UserProfile::create([
                'user_id' => $user->id,
                'first_name' => $formData['first_name'],
                'father_name' => $formData['father_name'],
                'grandfather_name' => $formData['grandfather_name'],
                'last_name' => $formData['last_name'],
                'phone' => $formData['phone'],
                'gender' => $gender,
                'birth_date' => $formData['birth_date'],
            ]);

            if ($formData['is_university']) {
                UniversityStudentInfo::create([
                    'user_id' => $user->id,
                    'university_id' => $formData['university_id'],
                    'college_id' => $formData['college_id'],
                    'major_id' => $formData['major_id'],
                ]);
            }

            $entry->delete();
            Cache::forget('pending_reg_' . $formData['email']);

            $token = $user->createToken('auth_token')->plainTextToken;

            // Fire-and-forget: wake up Python AI service after registration
            $this->warmupPythonApi();

            return response()->json([
                'message' => 'تم إنشاء الحساب بنجاح.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $this->syncSubscriberRole($user->load(['profile', 'universityInfo.major', 'universityInfo.university', 'universityInfo.college', 'activeSubscription.plan', 'activeSubscription.activationCard', 'roles'])),
            ], 201);
        });
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            AuditLog::create([
                'action' => 'failed_login',
                'new_values' => ['email' => $request->email],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            throw ValidationException::withMessages([
                'email' => ['بيانات الاعتماد غير صحيحة.'],
            ]);
        }

        if ($user->status == 0) { // Banned
            throw ValidationException::withMessages([
                'email' => ['تم حظر هذا الحساب بالكامل من قبل الإدارة. يرجى مراجعة المسؤول.'],
            ]);
        }
        
        if ($user->status == 2) { // Pending
            throw ValidationException::withMessages([
                'email' => ['هذا الحساب قيد المراجعة حالياً. يرجى الانتظار.'],
            ]);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Fire-and-forget: wake up Python AI service in background (no await, no timeout impact)
        $this->warmupPythonApi();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $this->syncSubscriberRole($user->load(['profile', 'universityInfo.major', 'universityInfo.university', 'universityInfo.college', 'activeSubscription.plan', 'roles'])),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'logout',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->syncSubscriberRole($request->user()->load(['profile', 'universityInfo.major', 'universityInfo.university', 'universityInfo.college', 'activeSubscription.plan', 'activeSubscription.activationCard', 'roles'])),
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|different:current_password',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['كلمة المرور الحالية غير صحيحة.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
            'must_change_password' => false,
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        try {
            $otp = VerificationCode::generateFor($request->email, 'password_reset');
            Mail::to($request->email)->send(new PasswordResetCode($otp->code));

            return response()->json(['message' => 'تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
        ]);

        $entry = VerificationCode::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', 'password_reset')
            ->where('expires_at', '>', now())
            ->first();

        if (!$entry) {
            return response()->json(['message' => 'الرمز غير صحيح أو انتهت صلاحيته.'], 422);
        }

        return response()->json(['message' => 'تم التحقق من الرمز بنجاح.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|min:8|confirmed',
        ]);

        $entry = VerificationCode::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', 'password_reset')
            ->where('expires_at', '>', now())
            ->first();

        if (!$entry) {
            return response()->json(['message' => 'الرمز غير صحيح أو انتهت صلاحيته.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        $entry->delete();

        return response()->json(['message' => 'تمت إعادة تعيين كلمة المرور بنجاح.']);
    }

    public function verifyEmailOTP(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        $entry = VerificationCode::where('email', $user->email)
            ->where('code', $request->code)
            ->where('type', 'email_verification')
            ->where('expires_at', '>', now())
            ->first();

        if (!$entry) {
            return response()->json(['message' => 'الرمز غير صحيح أو انتهت صلاحيته.'], 422);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        $entry->delete();

        return response()->json(['message' => 'تم توثيق البريد الإلكتروني بنجاح.']);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'البريد الإلكتروني موثق بالفعل.']);
        }

        $otp = VerificationCode::generateFor($user->email, 'email_verification');
        Mail::to($user->email)->send(new EmailVerificationCode($otp->code));

        return response()->json(['message' => 'تم إرسال رمز التحقق مجدداً.']);
    }

    /**
     * Fire-and-forget ping to wake up the Python API on Render.
     * Uses a short timeout and ignores any errors — does not affect login speed.
     */
    private function warmupPythonApi(): void
    {
        $pythonUrl = rtrim(env('PYTHON_API_URL', ''), '/');
        if (!$pythonUrl) return;

        try {
            \Illuminate\Support\Facades\Http::timeout(2)
                ->get("{$pythonUrl}/docs");
        } catch (\Exception $e) {
            // Silent — warmup failure should never affect login
        }
    }

    private function syncSubscriberRole($user)
    {
        // Avoid repeated checks if already processed in this request
        if (isset($user->permissions_synced)) return $user;

        $activeSub = $user->activeSubscription;
        $hasUniversityData = $user->is_university && $user->universityInfo;

        if ($activeSub && $hasUniversityData && !$user->hasRole('subscriber')) {
            if (!\Spatie\Permission\Models\Role::where('name', 'subscriber')->exists()) {
                \Spatie\Permission\Models\Role::create(['name' => 'subscriber', 'guard_name' => 'web']);
            }
            $user->assignRole('subscriber');
            $user->unsetRelation('roles');
        } elseif ((!$activeSub || !$hasUniversityData) && $user->hasRole('subscriber')) {
            $user->removeRole('subscriber');
            $user->unsetRelation('roles');
            
            \App\Models\UserSubscription::where('user_id', $user->id)
                ->where('status', 1)
                ->where('ends_at', '<', now())
                ->update(['status' => 0]);
        }
        
        // Ensure roles are loaded for the appends logic in the Model
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        $user->permissions_synced = true;
        
        return $user;
    }
}
