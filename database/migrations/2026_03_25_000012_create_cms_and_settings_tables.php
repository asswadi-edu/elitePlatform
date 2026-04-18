<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // System Settings — key-value store
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 191)->unique();
            $table->text('value')->nullable();
            // 'string' | 'boolean' | 'integer' | 'json'
            $table->string('type', 20)->default('string');
            // grouping for SystemSettings.js display: 'general'|'ai'|'limits'|'notifications'
            $table->string('group', 100)->default('general');
            $table->string('label', 255)->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Static/landing pages (About, Terms, Privacy)
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('title', 255);
            $table->longText('content')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // Announcements / Banners / Popups
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('content')->nullable();
            // 1=banner | 2=popup | 3=toast
            $table->tinyInteger('type')->default(1);
            // NULL=all | 1=students | 2=moderators | 3=admins
            $table->tinyInteger('target_role')->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'starts_at', 'ends_at'], 'idx_announcements_active');
        });

        // FAQs
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->text('answer');
            $table->smallInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('cms_pages');
        Schema::dropIfExists('system_settings');
    }
};
