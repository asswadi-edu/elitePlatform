<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\UniversityStudentInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SystemSettingController extends Controller
{
    /**
     * Get all system settings
     */
    public function index()
    {
        return response()->json(SystemSetting::all());
    }

    /**
     * Update multiple settings at once
     */
    public function updateBulk(Request $request)
    {
        $settings = $request->input('settings');
        
        if (!is_array($settings)) {
            return response()->json(['message' => 'Invalid settings format'], 400);
        }

        $clearCache = false;
        foreach ($settings as $s) {
            if ($s['key'] === 'ranking_system') $clearCache = true;
            $this->handleAcademicLevelUp($s['key'], $s['value']);
            SystemSetting::updateOrCreate(
                ['key' => $s['key']],
                [
                    'value' => $s['value'], 
                    'type' => $s['type'] ?? 'string', 
                    'group' => $s['group'] ?? 'general',
                    'label' => $s['label'] ?? null
                ]
            );
        }

        if ($clearCache) \App\Services\PointService::clearRankCache();

        return response()->json(['message' => 'تم حفظ الإعدادات بنجاح.']);
    }

    /**
     * Update or create a single setting
     */
    public function update(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'nullable'
        ]);

        if ($request->key === 'ranking_system') \App\Services\PointService::clearRankCache();
        
        $this->handleAcademicLevelUp($request->key, $request->value);
        $setting = SystemSetting::updateOrCreate(
            ['key' => $request->key],
            [
                'value' => $request->value,
                'type' => $request->type ?? 'string',
                'group' => $request->group ?? 'general',
                'label' => $request->label ?? null
            ]
        );

        return response()->json($setting);
    }

    /**
     * Upload a rank frame image.
     * Returns a full absolute URL so the frontend can use it directly without any PREFIX logic.
     */
    public function uploadRankFrame(Request $request)
    {
        $request->validate([
            'frame' => 'required|image|mimes:png|max:2048',
        ]);

        if ($request->hasFile('frame')) {
            $path = $request->file('frame')->store('ranks/frames', 'public');
            // Return FULL absolute URL — e.g. http://192.168.1.x:8000/storage/ranks/frames/file.png
            $fullUrl = url(\Illuminate\Support\Facades\Storage::url($path));
            return response()->json([
                'url'     => $fullUrl,
                'message' => 'تم رفع الإطار بنجاح'
            ]);
        }

        return response()->json(['message' => 'فشل رفع الملف'], 400);
    }

    /**
     * Handle student level advancement when semester changes from 2 to 1.
     */
    private function handleAcademicLevelUp($key, $value)
    {
        if ($key === 'current_semester' && (int)$value === 1) {
            $oldSemester = SystemSetting::where('key', 'current_semester')->first()->value ?? 1;
            // If transitioning from 2 to 1 (New Academic Year)
            if ((int)$oldSemester === 2) {
                // Increment level for all students
                DB::table('university_student_info')->increment('study_level');
            }
        }
    }
}
