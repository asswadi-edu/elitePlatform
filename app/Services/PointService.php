<?php

namespace App\Services;

use App\Models\UserPoints;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;

class PointService
{
    /**
     * Award points to a user.
     * 
     * @param int $userId
     * @param int $amount
     * @param string|null $reason
     * @return UserPoints
     */
    public static function awardPoints($userId, $amount, $reason = null)
    {
        $points = UserPoints::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0, 'total_earned' => 0]
        );

        $points->balance += $amount;
        if ($amount > 0) {
            $points->total_earned += $amount;
        }

        $points->save();
        
        // Potential: Add to audit log or notification here
        
        return $points;
    }

    /**
     * Deduct points from a user.
     * 
     * @param int $userId
     * @param int $amount
     * @return UserPoints
     */
    public static function deductPoints($userId, $amount)
    {
        $points = UserPoints::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0, 'total_earned' => 0]
        );

        $points->balance = max(0, $points->balance - $amount);
        $points->save();

        return $points;
    }

    /**
     * Clear the system ranks cache.
     */
    public static function clearRankCache()
    {
        Cache::forget('system_ranks');
    }

    /**
     * Get a specific point rule setting.
     */
    public static function getRule($key, $default = 0)
    {
        return SystemSetting::where('key', $key)->value('value') ?? $default;
    }
}
