<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            [
                'key' => 'ranking_system',
                'value' => json_encode([
                    ['name' => 'طالب', 'minPts' => 0, 'maxPts' => 24, 'color' => '#6B7280', 'bg' => '#F3F4F6', 'icon' => 'PiGraduationCapDuotone', 'borderColor' => '#D1D5DB', 'useColor' => true, 'useFrame' => false, 'frameUrl' => ''],
                    ['name' => 'نشط', 'minPts' => 25, 'maxPts' => 49, 'color' => '#3B82F6', 'bg' => '#EFF6FF', 'icon' => 'PiLightningDuotone', 'borderColor' => '#3B82F6', 'useColor' => true, 'useFrame' => false, 'frameUrl' => ''],
                    ['name' => 'متميز', 'minPts' => 50, 'maxPts' => 74, 'color' => '#F59E0B', 'bg' => '#FFFBEB', 'icon' => 'PiStarDuotone', 'borderColor' => '#F59E0B', 'useColor' => true, 'useFrame' => false, 'frameUrl' => ''],
                    ['name' => 'VIP', 'minPts' => 75, 'maxPts' => 99999, 'color' => '#8B5CF6', 'bg' => '#F5F3FF', 'icon' => 'PiStarDuotone', 'borderColor' => '#8B5CF6', 'useColor' => true, 'useFrame' => true, 'frameUrl' => 'https://cdn-icons-png.flaticon.com/512/610/610120.png']
                ]),
                'type' => 'json',
                'group' => 'trust',
                'label' => 'Ranking System Definitions'
            ],
            [
                'key' => 'likes_per_point',
                'value' => '10',
                'type' => 'integer',
                'group' => 'trust',
                'label' => 'Likes per 1 point'
            ],
            [
                'key' => 'points_for_quiz',
                'value' => '10',
                'type' => 'integer',
                'group' => 'trust',
                'label' => 'Points awarded for passing a quiz'
            ],
            [
                'key' => 'points_to_suspend',
                'value' => '20',
                'type' => 'integer',
                'group' => 'trust',
                'label' => 'Points deducted to suspend student'
            ]
        ];

        foreach ($settings as $setting) {
            \DB::table('system_settings')->updateOrInsert(['key' => $setting['key']], $setting);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \DB::table('system_settings')->whereIn('key', ['ranking_system', 'likes_per_point', 'points_for_quiz', 'points_to_suspend'])->delete();
    }
};
