<?php

namespace Database\Seeders;

use App\Models\Field;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FieldSeeder extends Seeder
{
    public function run(): void
    {
        $fields = [
            [
                'name' => 'المجال التقني والهندسي',
                'icon_key' => 'Monitor',
                'color_hex' => '#3B5BDB',
                'description' => 'يشمل علوم الحاسوب، هندسة البرمجيات، والذكاء الاصطناعي.',
            ],
            [
                'name' => 'المجال الطبي والصحي',
                'icon_key' => 'Medical',
                'color_hex' => '#E03131',
                'description' => 'يشمل الطب البشري، الصيدلة، والمختبرات.',
            ],
            [
                'name' => 'المجال الإداري والمالي',
                'icon_key' => 'Business',
                'color_hex' => '#099268',
                'description' => 'يشمل المحاسبة، إدارة الأعمال، والتسويق.',
            ],
            [
                'name' => 'المجال الإنساني واللغوي',
                'icon_key' => 'Language',
                'color_hex' => '#F08C00',
                'description' => 'يشمل اللغات، الترجمة، والعلوم الإنسانية.',
            ],
        ];

        foreach ($fields as $field) {
            Field::updateOrCreate(
                ['name' => $field['name']], 
                array_merge($field, ['uuid' => (string) Str::uuid()])
            );
        }
    }
}
