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
        DB::table('system_settings')->updateOrInsert(
            ['key' => 'user_editable_fields'],
            [
                'value' => json_encode([
                    'first_name' => true,
                    'father_name' => true,
                    'grandfather_name' => true,
                    'last_name' => true,
                    'phone' => true,
                    'email' => true,
                    'gender' => true
                ]),
                'type' => 'json',
                'group' => 'user_permissions',
                'label' => 'حقول ملف المستخدم القابلة للتعديل',
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('system_settings')->where('key', 'user_editable_fields')->delete();
    }
};
