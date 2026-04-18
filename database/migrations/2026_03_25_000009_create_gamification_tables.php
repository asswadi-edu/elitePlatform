<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rules that define how points are earned/deducted
        Schema::create('point_rules', function (Blueprint $table) {
            $table->id();
            // e.g. 'resource_uploaded','resource_liked','challenge_won','resource_disliked'
            $table->string('action_key', 100)->unique();
            // positive = earning, negative = deduction
            $table->smallInteger('points');
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Current balance per user (updated via Observer, not calculated on-the-fly)
        Schema::create('user_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->integer('balance')->default(0);
            $table->integer('total_earned')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Full ledger of point changes
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->smallInteger('points');
            $table->foreignId('rule_id')->nullable()->constrained('point_rules')->nullOnDelete();
            $table->string('reason_type', 100)->nullable();
            $table->unsignedBigInteger('reason_id')->nullable();
            $table->string('note', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'created_at'], 'idx_pt_user_date');
        });

        // Available badges/awards
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('icon', 255)->nullable();
            $table->string('color_hex', 10)->default('#3B5BDB');
            $table->json('criteria')->nullable();
            $table->timestamps();
        });

        // Badges earned per user
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('badge_id')->constrained('badges')->cascadeOnDelete();
            $table->timestamp('awarded_at')->useCurrent();

            $table->unique(['user_id', 'badge_id'], 'uq_user_badge');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('user_points');
        Schema::dropIfExists('point_rules');
    }
};
