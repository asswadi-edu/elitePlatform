<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Audit Logs — NO soft deletes, NO FK for performance
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            // intentionally no FK — decoupled for performance
            $table->unsignedBigInteger('user_id')->nullable();
            // 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'approved' ...
            $table->string('action', 100);
            $table->string('auditable_type', 100)->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'action', 'created_at'], 'idx_audit_user_action_date');
            // Note: PARTITION BY RANGE (YEAR) required in production
        });

        // Moderator Activity Log (ModLog.js)
        Schema::create('moderator_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moderator_id')->constrained('users')->cascadeOnDelete();
            // e.g. 'approved_resource' | 'rejected_resource' | 'banned_user' | 'revoked_trust'
            $table->string('action_type', 100);
            $table->string('target_type', 100)->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['moderator_id', 'created_at'], 'idx_modlog_mod_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderator_logs');
        Schema::dropIfExists('audit_logs');
    }
};
