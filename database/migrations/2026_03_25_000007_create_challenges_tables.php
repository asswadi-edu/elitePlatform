<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Challenges
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('quiz_id')->nullable()->constrained('quizzes')->nullOnDelete();
            // 0=draft | 1=active | 2=ended
            $table->tinyInteger('status')->default(0);
            $table->smallInteger('max_participants')->nullable();
            $table->dateTime('start_at')->nullable();
            $table->dateTime('end_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'start_at'], 'idx_challenges_status');
        });

        // Challenge Participants
        Schema::create('challenge_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            // 0=joined | 1=completed | 2=withdrew
            $table->tinyInteger('status')->default(0);
            $table->timestamps();

            $table->unique(['challenge_id', 'user_id'], 'uq_challenge_user');
        });

        // Challenge Submissions (results per participant)
        Schema::create('challenge_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('attempt_id')->nullable()->constrained('quiz_attempts')->nullOnDelete();
            $table->tinyInteger('score')->nullable();
            $table->smallInteger('rank')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
        });

        // Add FK from quizzes to challenges (circular, added after challenges table)
        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreign('challenge_id')->references('id')->on('challenges')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropForeign(['challenge_id']);
        });
        Schema::dropIfExists('challenge_submissions');
        Schema::dropIfExists('challenge_participants');
        Schema::dropIfExists('challenges');
    }
};
