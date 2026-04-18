<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'الباقة الشهرية',
                'price' => 2000, // مثلا 2000 ريال
                'duration_days' => 30,
                'color_hex' => '#3B5BDB',
                'is_active' => true,
            ],
            [
                'name' => 'الباقة الربع سنوية',
                'price' => 5000,
                'duration_days' => 90,
                'color_hex' => '#0CA678',
                'is_active' => true,
            ],
            [
                'name' => 'الباقة السنوية',
                'price' => 15000,
                'duration_days' => 365,
                'color_hex' => '#F08C00',
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
