<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Subscription Plans (شهري / ربع سنوي / سنوي)
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->decimal('price', 8, 2);
            $table->smallInteger('duration_days');
            $table->string('color_hex', 10)->default('#3B5BDB');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Plan Features
        Schema::create('plan_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('subscription_plans')->cascadeOnDelete();
            $table->string('feature_key', 100);
            $table->string('feature_label', 255);
            $table->string('value', 100)->default('true');
            $table->timestamps();
        });

        // Activation Cards (NKBH-XXXX-XXXX-XXXX)
        Schema::create('activation_cards', function (Blueprint $table) {
            $table->id();
            // SHA-256 hash of the full code — never store plain text
            $table->string('code_hash', 64)->unique();
            // last 4 chars for admin display only
            $table->string('code_suffix', 4);
            $table->foreignId('plan_id')->constrained('subscription_plans')->restrictOnDelete();
            // price may differ from plan price (custom batch price)
            $table->decimal('price', 8, 2);
            $table->unsignedBigInteger('batch_id')->nullable()->index();
            $table->foreignId('generated_by')->constrained('users')->restrictOnDelete();
            $table->boolean('is_used')->default(false);
            $table->foreignId('used_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['plan_id', 'is_used'], 'idx_cards_plan_status');
        });

        // User Subscriptions
        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('subscription_plans')->restrictOnDelete();
            $table->foreignId('activation_card_id')->nullable()->constrained('activation_cards')->nullOnDelete();
            // 1=active | 0=expired | 2=cancelled
            $table->tinyInteger('status')->default(1);
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            // 'card' | 'manual' | 'admin'
            $table->string('activated_by', 20)->default('card');
            $table->timestamps();

            $table->index(['user_id', 'status', 'ends_at'], 'idx_subs_user_status_end');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_subscriptions');
        Schema::dropIfExists('activation_cards');
        Schema::dropIfExists('plan_features');
        Schema::dropIfExists('subscription_plans');
    }
};
