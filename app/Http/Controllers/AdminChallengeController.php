<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Challenge;
use App\Models\ChallengeLevel;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;

class AdminChallengeController extends Controller
{
    public function getSettings()
    {
        $settings = SystemSetting::pluck('value', 'key')->toArray();
        $levels = ChallengeLevel::orderBy('required_gold_stars', 'asc')->get();
        
        $totalChallenges = Challenge::count();
        $totalStars = UserProfile::sum('stars_bronze') + UserProfile::sum('stars_silver') + UserProfile::sum('stars_gold');
        $avgGold = UserProfile::avg('stars_gold') ?? 0;
        $highestAvgLevelRecord = ChallengeLevel::where('required_gold_stars', '<=', $avgGold)->orderBy('required_gold_stars', 'desc')->first();
        $averageLevel = $highestAvgLevelRecord ? $highestAvgLevelRecord->level_number : 1;
        $todayChallenges = Challenge::whereDate('created_at', today())->count();

        return response()->json([
            'settings' => [
                'bronze_to_silver' => $settings['challenge_bronze_to_silver'] ?? 50,
                'silver_to_gold' => $settings['challenge_silver_to_gold'] ?? 10,
                'speed_bonus_bronze' => $settings['challenge_speed_bonus_bronze'] ?? 10,
                'combo_bonus_bronze' => $settings['challenge_combo_bonus_bronze'] ?? 2,
            ],
            'levels' => $levels,
            'stats' => [
                'totalChallenges' => $totalChallenges,
                'totalStars' => $totalStars,
                'averageLevel' => $averageLevel,
                'todayChallenges' => $todayChallenges
            ]
        ]);
    }

    public function saveSettings(Request $request)
    {
        $keys = ['challenge_bronze_to_silver', 'challenge_silver_to_gold', 'challenge_speed_bonus_bronze', 'challenge_combo_bonus_bronze'];
        foreach($keys as $key) {
            if ($request->has($key)) {
                SystemSetting::updateOrCreate(['key' => $key], ['value' => $request->$key]);
            }
        }
        return response()->json(['message' => 'تم حفظ الإعدادات بنجاح']);
    }

    public function saveLevel(Request $request) {
        $data = $request->validate([
            'id' => 'nullable|integer',
            'level_number' => 'required|integer',
            'name' => 'required|string',
            'required_gold_stars' => 'required|integer'
        ]);

        if (!empty($data['id'])) {
            ChallengeLevel::where('id', $data['id'])->update($data);
        } else {
            ChallengeLevel::create($data);
        }
        return response()->json(['message' => 'تم حفظ المستوى']);
    }

    public function deleteLevel($id) {
        ChallengeLevel::where('id', $id)->delete();
        return response()->json(['message' => 'تم الحذف']);
    }

    public function getLeaderboard()
    {
        $topUsers = User::whereHas('profile')
            ->join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
            ->orderBy('user_profiles.stars_gold', 'desc')
            ->orderBy('user_profiles.stars_silver', 'desc')
            ->orderBy('user_profiles.stars_bronze', 'desc')
            ->select('users.id', 'user_profiles.first_name', 'user_profiles.last_name', 'user_profiles.stars_gold', 'user_profiles.stars_silver', 'user_profiles.stars_bronze')
            ->limit(10)
            ->get()
            ->map(function($u) {
                $lvlRecord = ChallengeLevel::where('required_gold_stars', '<=', $u->stars_gold)->orderBy('required_gold_stars', 'desc')->first();
                return [
                    'id' => $u->id,
                    'name' => $u->first_name . ' ' . $u->last_name,
                    'stars_gold' => $u->stars_gold,
                    'stars_silver' => $u->stars_silver,
                    'stars_bronze' => $u->stars_bronze,
                    'level' => $lvlRecord ? $lvlRecord->level_number : 1,
                    'level_name' => $lvlRecord ? $lvlRecord->name : 'مبتدئ'
                ];
            });

        return response()->json(['leaderboard' => $topUsers]);
    }
}
