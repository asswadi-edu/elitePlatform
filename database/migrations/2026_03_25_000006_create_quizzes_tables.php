<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // AI Job tracker — created BEFORE a quiz is generated
        Schema::create('quiz_ai_jobs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject_name', 191);
            $table->string('file_url', 500)->nullable();
            $table->string('file_name', 255)->nullable();
            // 10 | 20 | 30 | 40
            $table->tinyInteger('num_questions')->default(20);
            // minutes: 10|20|30|40|60
            $table->smallInteger('time_limit')->default(20);
            // 1=simple | 2=medium | 3=hard
            $table->tinyInteger('difficulty')->default(2);
            // 0=pending | 1=processing | 2=done | 3=failed
            $table->tinyInteger('status')->default(0);
            $table->string('ai_model_used', 100)->nullable();
            $table->unsignedInteger('ai_tokens_used')->nullable();
            $table->text('error_message')->nullable();
            // filled after success
            $table->unsignedBigInteger('quiz_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status'], 'idx_ai_jobs_user_status');
        });

        // Quizzes — both AI-generated and challenge quizzes
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('subject_name', 191);
            $table->foreignId('ai_job_id')->nullable()->constrained('quiz_ai_jobs')->nullOnDelete();
            $table->string('source_file_url', 500)->nullable();
            $table->string('source_file_name', 255)->nullable();
            $table->tinyInteger('num_questions')->default(20);
            $table->smallInteger('time_limit')->default(20);
            $table->tinyInteger('difficulty')->default(2);
            $table->boolean('is_challenge_quiz')->default(false);
            $table->unsignedBigInteger('challenge_id')->nullable();
            $table->timestamps();

            $table->index('user_id', 'idx_quizzes_user');
            $table->index('subject_id', 'idx_quizzes_subject');
        });

        // Add FK from quiz_ai_jobs to quizzes now that quizzes table exists
        Schema::table('quiz_ai_jobs', function (Blueprint $table) {
            $table->foreign('quiz_id')->references('id')->on('quizzes')->nullOnDelete();
        });

        // Quiz Questions
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->text('question_text');
            // 1=MCQ | 2=True/False
            $table->tinyInteger('question_type')->default(1);
            // for T/F: "true" or "false"
            $table->string('correct_answer', 255)->nullable();
            $table->text('explanation')->nullable();
            $table->smallInteger('display_order')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index('quiz_id', 'idx_questions_quiz');
        });

        // Question Options (MCQ only)
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->string('option_text', 500);
            $table->boolean('is_correct')->default(false);
            $table->tinyInteger('display_order')->default(0);
        });

        // Quiz Attempts (per user per quiz)
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();
            $table->smallInteger('time_taken')->nullable();
            $table->tinyInteger('score')->nullable();
            $table->tinyInteger('total_questions')->nullable();
            $table->tinyInteger('correct_count')->nullable();
            // 0=in_progress | 1=completed | 2=abandoned
            $table->tinyInteger('status')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'quiz_id'], 'idx_attempts_user_quiz');
            $table->index('status', 'idx_attempts_status');
        });

        // Quiz Answers (one row per question per attempt)
        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->foreignId('chosen_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            // "true"/"false" for T/F questions
            $table->string('text_answer', 10)->nullable();
            $table->boolean('is_correct')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['attempt_id', 'question_id'], 'idx_answers_attempt_q');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('quiz_ai_jobs');
    }
};
