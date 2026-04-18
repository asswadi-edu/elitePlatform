<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        // Fetch editable fields settings
        $settings = SystemSetting::where('key', 'user_editable_fields')->first();
        $editableFields = $settings ? json_decode($settings->value, true) : [];

        $rules = [];
        if ($editableFields['first_name'] ?? true) $rules['first_name'] = 'string|max:60';
        if ($editableFields['father_name'] ?? true) $rules['father_name'] = 'string|max:60';
        if ($editableFields['grandfather_name'] ?? true) $rules['grandfather_name'] = 'string|max:60';
        if ($editableFields['last_name'] ?? true) $rules['last_name'] = 'string|max:60';
        if ($editableFields['phone'] ?? true) $rules['phone'] = 'string|max:20';
        if ($editableFields['gender'] ?? true) $rules['gender'] = 'string|in:male,female';
        if ($editableFields['birth_date'] ?? true) $rules['birth_date'] = 'nullable|date|before:today';
        
        // Email is on the User model
        if ($editableFields['email'] ?? true) {
            $rules['email'] = 'email|unique:users,email,' . $user->id;
        }

        $validated = $request->validate($rules);

        return DB::transaction(function () use ($user, $profile, $validated, $editableFields) {
            $profileData = [];
            $userData = [];

            foreach ($validated as $key => $value) {
                if ($key === 'email' && ($editableFields['email'] ?? true)) {
                    $userData['email'] = $value;
                } else if ($editableFields[$key] ?? true) {
                    if ($key === 'gender') {
                        $genderMap = ['male' => 1, 'female' => 2];
                        $profileData[$key] = $genderMap[$value] ?? null;
                    } else {
                        $profileData[$key] = $value;
                    }
                }
            }

            if (!empty($userData)) {
                $user->update($userData);
            }

            if (!empty($profileData)) {
                $profile->update($profileData);
            }

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->load('profile', 'universityInfo', 'activeSubscription.plan')
            ]);
        });
    }

    /**
     * Upload an avatar for the authenticated user.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();
        $profile = $user->profile;

        if ($request->hasFile('avatar')) {
            $imageName = time() . '_' . $user->id . '.' . $request->avatar->extension();
            
            // Delete old avatar if it's local
            if ($profile->avatar_url && str_starts_with($profile->avatar_url, '/uploads/avatars/')) {
                $oldPath = public_path($profile->avatar_url);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $request->avatar->move(public_path('uploads/avatars'), $imageName);
            $profile->avatar_url = '/uploads/avatars/' . $imageName;
            $profile->save();

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => $profile->avatar_url
            ]);
        }
    }

    /**
     * Delete the authenticated user's avatar.
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if ($profile->avatar_url) {
            // Delete old avatar if it's local
            if (str_starts_with($profile->avatar_url, '/uploads/avatars/')) {
                $oldPath = public_path($profile->avatar_url);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $profile->avatar_url = null;
            $profile->save();

            return response()->json([
                'message' => 'Avatar deleted successfully',
                'user' => $user->load('profile')
            ]);
        }

        return response()->json(['message' => 'No avatar to delete'], 400);
    }

    /**
     * Update university-specific information.
     */
    public function updateUniversityInfo(Request $request)
    {
        $user = $request->user();
        
        // Fetch editable fields settings
        $settings = SystemSetting::where('key', 'user_editable_fields')->first();
        $editableFields = $settings ? json_decode($settings->value, true) : [];

        $rules = [];
        if ($editableFields['university_id'] ?? true) $rules['university_id'] = 'required|exists:universities,id';
        if ($editableFields['college_id'] ?? true)    $rules['college_id']    = 'required|exists:colleges,id';
        if ($editableFields['major_id'] ?? true)      $rules['major_id']      = 'required|exists:majors,id';
        if ($editableFields['academic_number'] ?? true) $rules['academic_number'] = 'nullable|string|max:50';
        if ($editableFields['study_level'] ?? true)   $rules['study_level']   = 'required|integer|min:1|max:12';

        $validated = $request->validate($rules);

        return DB::transaction(function () use ($user, $validated) {
            $info = \App\Models\UniversityStudentInfo::updateOrCreate(
                ['user_id' => $user->id],
                $validated
            );

            // Mark user as university student
            $user->update(['is_university' => true]);

            return response()->json([
                'message' => 'University information updated successfully',
                'user' => $user->load('profile', 'universityInfo', 'activeSubscription.plan')
            ]);
        });
    }
}
