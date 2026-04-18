<?php

namespace Database\Seeders;

use App\Models\University;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UniversitySeeder extends Seeder
{
    public function run(): void
    {
        $universities = [
            ['name' => 'جامعة صنعاء', 'type' => 1, 'city' => 'صنعاء'],
            ['name' => 'جامعة عدن', 'type' => 1, 'city' => 'عدن'],
            ['name' => 'جامعة العلوم والتكنولوجيا', 'type' => 1, 'city' => 'صنعاء/عدن'],
            ['name' => 'جامعة تعز', 'type' => 1, 'city' => 'تعز'],
            ['name' => 'جامعة إب', 'type' => 1, 'city' => 'إب'],
            ['name' => 'جامعة ذمار', 'type' => 1, 'city' => 'ذمار'],
        ];

        foreach ($universities as $uni) {
            University::updateOrCreate(['name' => $uni['name']], array_merge($uni, [
                'uuid' => (string) Str::uuid(),
                'is_active' => true,
            ]));
        }
    }
}
