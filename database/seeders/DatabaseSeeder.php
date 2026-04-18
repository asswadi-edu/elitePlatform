<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SubscriptionPlanSeeder::class,
            FieldSeeder::class,
            UniversitySeeder::class,
            CollegeSeeder::class,
            MajorSeeder::class,
            PointRuleSeeder::class,
            SystemSettingSeeder::class,
            AptitudeTestSeeder::class,
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
        ]);
    }
}
