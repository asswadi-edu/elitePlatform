<?php

namespace Database\Seeders;

use App\Models\PointRule;
use Illuminate\Database\Seeder;

class PointRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            ['action_key' => 'resource_uploaded', 'points' => 10, 'description' => 'عند رفع ملخص أو ملف تعليمي'],
            ['action_key' => 'resource_liked', 'points' => 2, 'description' => 'عندما يحصل ملفك على إعجاب'],
            ['action_key' => 'resource_disliked', 'points' => -2, 'description' => 'عندما يحصل ملفك على عدم إعجاب'],
            ['action_key' => 'challenge_won', 'points' => 50, 'description' => 'عند الفوز في تحدي'],
            ['action_key' => 'quiz_completed', 'points' => 5, 'description' => 'عند إكمال اختبار ذكي'],
            ['action_key' => 'suggestion_implemented', 'points' => 100, 'description' => 'عند تنفيذ اقتراح قدمته'],
        ];

        foreach ($rules as $rule) {
            PointRule::updateOrCreate(['action_key' => $rule['action_key']], $rule);
        }
    }
}
