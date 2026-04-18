<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Phase 2A: Universities
        Schema::create('universities', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 191);
            // 1=جامعة | 2=كلية | 3=معهد
            $table->tinyInteger('type')->default(1);
            $table->string('city', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        // Phase 2B: Fields (المجالات الكبرى)
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 191);
            // icon key matching AVAILABLE_ICONS in frontend: Monitor/Medical/Business...
            $table->string('icon_key', 50)->default('General');
            $table->string('color_hex', 10)->default('#3B5BDB');
            $table->text('description')->nullable();
            $table->tinyInteger('display_order')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });

        // Phase 2C: Colleges (الكليات) — renamed from faculties per user request
        Schema::create('colleges', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 191);
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->foreignId('field_id')->nullable()->constrained('fields')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index('university_id', 'idx_colleges_university');
            $table->index('field_id', 'idx_colleges_field');
        });

        // Phase 2D: Majors (التخصصات)
        Schema::create('majors', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 191);
            $table->foreignId('college_id')->nullable()->constrained('colleges')->nullOnDelete();
            $table->foreignId('field_id')->nullable()->constrained('fields')->nullOnDelete();
            $table->text('description')->nullable();
            // JSON array of career paths e.g. ["مطور برمجيات","مهندس ذكاء اصطناعي"]
            $table->json('careers')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('college_id', 'idx_majors_college');
            $table->index('field_id', 'idx_majors_field');
        });

        // Phase 2E: Subjects (المواد الدراسية)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 191);
            $table->string('code', 30);
            $table->foreignId('major_id')->constrained('majors')->cascadeOnDelete();
            // false = تخصصية (مدفوعة) | true = متطلب (مجاني للجميع)
            $table->boolean('is_free')->default(false);
            $table->tinyInteger('credit_hours')->default(3);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['code', 'major_id'], 'uq_subjects_code_major');
            $table->index('major_id', 'idx_subjects_major');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('majors');
        Schema::dropIfExists('colleges');
        Schema::dropIfExists('fields');
        Schema::dropIfExists('universities');
    }
};
