<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // AI Settings
            ['key' => 'ai_quiz_prompt', 'value' => "أنت خبير تعليمي محترف. مهمتك هي استخراج أسئلة اختبار عالية الجودة من النص المزود.\nيجب أن يكون الاختبار مكوناً من @count سؤال.\nدرجة الصعوبة: @difficulty.\nيجب أن تتوزع الأسئلة بنسبة 50% اختيار من متعدد و 50% صح/خطأ.\nيجب إرجاع النتيجة بتنسيق JSON حصراً.", 'type' => 'string', 'group' => 'ai', 'label' => 'AI Quiz Generation Prompt'],
            ['key' => 'ai_test_enabled', 'value' => 'true', 'type' => 'boolean', 'group' => 'ai', 'label' => 'Enable AI Test Generation'],
            ['key' => 'ai_test_model', 'value' => 'gpt-4o', 'type' => 'string', 'group' => 'ai', 'label' => 'AI Model (GPT-4o, Gemini, etc.)'],
            ['key' => 'ai_test_api_key', 'value' => '', 'type' => 'string', 'group' => 'ai', 'label' => 'AI API Key'],
            ['key' => 'ai_test_max_file_size', 'value' => '10', 'type' => 'integer', 'group' => 'ai', 'label' => 'Max File Size for AI (MB)'],
            ['key' => 'ai_max_tokens', 'value' => '2000', 'type' => 'integer', 'group' => 'ai', 'label' => 'Max AI Tokens per Request'],
            
            // Limit Settings
            ['key' => 'max_upload_size_mb', 'value' => '10', 'type' => 'integer', 'group' => 'limits', 'label' => 'Max File Upload Size (MB)'],
            ['key' => 'daily_points_limit', 'value' => '200', 'type' => 'integer', 'group' => 'limits', 'label' => 'Daily Point Earning Limit'],
            
            // Subscription Settings
            ['key' => 'trial_period_days', 'value' => '7', 'type' => 'integer', 'group' => 'subscriptions', 'label' => 'Free Trial Period (Days)'],
            ['key' => 'allow_card_activation', 'value' => 'true', 'type' => 'boolean', 'group' => 'subscriptions', 'label' => 'Allow Offline Card Activation'],
            
            // General & Identity Settings
            ['key' => 'site_name', 'value' => 'منصة النخبة', 'type' => 'string', 'group' => 'identity', 'label' => 'Site Display Name'],
            ['key' => 'site_slogan', 'value' => 'منصة النخبة للتعليم الأكاديمي', 'type' => 'string', 'group' => 'identity', 'label' => 'Site Slogan'],
            ['key' => 'site_logo', 'value' => '', 'type' => 'string', 'group' => 'identity', 'label' => 'Site Logo URL'],
            ['key' => 'primary_color', 'value' => '#2563EB', 'type' => 'string', 'group' => 'identity', 'label' => 'Primary Brand Color'],
            ['key' => 'maintenance_mode', 'value' => 'false', 'type' => 'boolean', 'group' => 'identity', 'label' => 'Maintenance Mode'],
            ['key' => 'allow_registration', 'value' => 'true', 'type' => 'boolean', 'group' => 'access', 'label' => 'Allow Public Registration'],
            
            // Social & Contact Settings
            ['key' => 'contact_email', 'value' => 'support@elite.edu', 'type' => 'string', 'group' => 'social', 'label' => 'Contact Email'],
            ['key' => 'contact_phone', 'value' => '+967 7xx xxx xxx', 'type' => 'string', 'group' => 'social', 'label' => 'Contact Phone'],
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/elite', 'type' => 'string', 'group' => 'social', 'label' => 'Facebook URL'],
            ['key' => 'social_telegram', 'value' => 'https://t.me/elite_edu', 'type' => 'string', 'group' => 'social', 'label' => 'Telegram URL'],
            ['key' => 'social_whatsapp', 'value' => 'https://wa.me/9677xxxxxxxx', 'type' => 'string', 'group' => 'social', 'label' => 'WhatsApp Number'],
            
            ['key' => 'support_email', 'value' => 'support@eliteplatform.com', 'type' => 'string', 'group' => 'general', 'label' => 'Technical Support Email'],

            // Academic Settings
            ['key' => 'current_semester', 'value' => '1', 'type' => 'integer', 'group' => 'academic', 'label' => 'Current Academic Semester'],
            ['key' => 'current_academic_year', 'value' => date('Y') . '/' . (date('Y') + 1), 'type' => 'string', 'group' => 'academic', 'label' => 'Current Academic Year'],
            ['key' => 'max_semester_subjects', 'value' => '12', 'type' => 'integer', 'group' => 'academic', 'label' => 'Maximum Subjects per Semester'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
