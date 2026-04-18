<?php

namespace Database\Seeders;

use App\Models\Major;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MajorSeeder extends Seeder
{
    public function run(): void
    {
        $majors = [
            ['college_id' => 1, 'field_id' => 1, 'name' => 'هندسة مدنية'],
            ['college_id' => 1, 'field_id' => 1, 'name' => 'هندسة معمارية'],
            ['college_id' => 2, 'field_id' => 1, 'name' => 'علوم حاسوب'],
            ['college_id' => 2, 'field_id' => 1, 'name' => 'نظم معلومات'],
            ['college_id' => 2, 'field_id' => 1, 'name' => 'تقنية معلومات'],
        ];

        foreach ($majors as $major) {
            Major::updateOrCreate(['name' => $major['name'], 'college_id' => $major['college_id']], array_merge($major, [
                'uuid' => (string) Str::uuid(),
                'is_active' => true,
            ]));
        }
    }
}
