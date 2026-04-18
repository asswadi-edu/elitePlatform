<?php

namespace Database\Seeders;

use App\Models\College;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CollegeSeeder extends Seeder
{
    public function run(): void
    {
        $colleges = [
            ['field_id' => 1, 'name' => 'كلية الهندسة'],
            ['field_id' => 1, 'name' => 'كلية الحاسوب وتكنولوجيا المعلومات'],
            ['field_id' => 1, 'name' => 'كلية الطب والعلوم الصحية'],
        ];

        foreach ($colleges as $college) {
            College::updateOrCreate(['name' => $college['name']], array_merge($college, [
                'uuid' => (string) Str::uuid(),
            ]));
        }
    }
}
