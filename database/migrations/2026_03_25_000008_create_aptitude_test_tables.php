<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Aptitude Test versions
        Schema::create('aptitude_tests', function (Blueprint $table) {
            $table->id();
            $table->string('version', 20)->default('1.0');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        // Test Questions (Likert Scale statements)
        Schema::create('aptitude_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained('aptitude_tests')->cascadeOnDelete();
            $table->text('question_text');
            $table->tinyInteger('display_order')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index('test_id', 'idx_apt_questions_test');
        });

        // User attempts of the aptitude test
        Schema::create('user_aptitude_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('test_id')->constrained('aptitude_tests')->restrictOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();
            // elapsed seconds (from frontend timer)
            $table->smallInteger('time_taken')->nullable();
            // 0=started | 1=completed
            $table->tinyInteger('status')->default(0);
            $table->timestamps();

            $table->index('user_id', 'idx_apt_attempts_user');
        });

        // Answers per question per attempt
        Schema::create('user_aptitude_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('user_aptitude_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('aptitude_questions')->cascadeOnDelete();
            // 1=أوافق بشدة | 2=أوافق | 3=محايد | 4=لا أوافق | 5=لا أوافق بشدة
            $table->tinyInteger('answer_value');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['attempt_id', 'question_id'], 'idx_apt_answers_attempt');
        });

        // Results from Python ML Model
        Schema::create('user_aptitude_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->unique()->constrained('user_aptitude_attempts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // e.g. "المجال التقني"
            $table->string('best_field_name', 191)->nullable();
            $table->foreignId('best_field_id')->nullable()->constrained('fields')->nullOnDelete();
            // 0-100 match percentage returned by Python model
            $table->tinyInteger('match_percentage')->nullable();
            // [{major_id, major_name, score}, ...]
            $table->json('suggested_majors')->nullable();
            // full raw response from Python API for debugging
            $table->json('raw_ml_response')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id', 'idx_apt_results_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_aptitude_results');
        Schema::dropIfExists('user_aptitude_answers');
        Schema::dropIfExists('user_aptitude_attempts');
        Schema::dropIfExists('aptitude_questions');
        Schema::dropIfExists('aptitude_tests');
    }
};
