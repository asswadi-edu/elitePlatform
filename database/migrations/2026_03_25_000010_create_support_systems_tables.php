<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Internal Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            // recipient
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // e.g. 'resource_approved' | 'challenge_started' | 'badge_earned'
            $table->string('type', 100);
            // flexible payload — rendered by frontend
            $table->json('data')->nullable();
            $table->string('notifiable_type', 100)->nullable();
            $table->unsignedBigInteger('notifiable_id')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'read_at'], 'idx_notif_user_read');
            // Note: PARTITION BY RANGE (YEAR) recommended for production
        });

        // Reports (Polymorphic — can report any entity)
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            // 'resource' | 'user' | 'comment'
            $table->string('reportable_type', 100);
            $table->unsignedBigInteger('reportable_id');
            // 1=محتوى مسيء | 2=خطأ | 3=انتهاك | 4=أخرى
            $table->tinyInteger('report_type')->default(4);
            $table->text('description')->nullable();
            // 0=pending | 1=reviewed | 2=resolved | 3=dismissed
            $table->tinyInteger('status')->default(0);
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->timestamps();

            $table->index(['reportable_type', 'reportable_id'], 'idx_reports_poly');
            $table->index('status', 'idx_reports_status');
        });

        // Suggestions from users
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // 1=واجهة | 2=ميزة جديدة | 3=خطأ | 4=أخرى
            $table->tinyInteger('category')->default(4);
            $table->string('title', 255);
            $table->text('description');
            // 0=new | 1=reviewed | 2=implemented | 3=rejected
            $table->tinyInteger('status')->default(0);
            $table->text('admin_response')->nullable();
            $table->unsignedInteger('upvotes_count')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });

        // Community votes on suggestions
        Schema::create('suggestion_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('suggestion_id')->constrained('suggestions')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'suggestion_id'], 'uq_suggestion_vote');
        });

        // Summary Requests
        Schema::create('summary_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('subject_name', 191)->nullable();
            $table->text('description')->nullable();
            // 0=pending | 1=assigned | 2=fulfilled | 3=cancelled
            $table->tinyInteger('status')->default(0);
            $table->foreignId('fulfilled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fulfilled_at')->nullable();
            $table->foreignId('resource_id')->nullable()->constrained('resources')->nullOnDelete();
            $table->timestamps();

            $table->index(['subject_id', 'status'], 'idx_summary_subject_status');
        });

        // Contributor Profiles
        Schema::create('contributor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->unsignedInteger('total_resources')->default(0);
            $table->unsignedInteger('total_likes')->default(0);
            $table->unsignedInteger('total_dislikes')->default(0);
            $table->timestamps();
        });

        // History of trust grants and revocations
        Schema::create('trust_grants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            // 1=manual (by admin/mod) | 2=automatic (by points rule)
            $table->tinyInteger('grant_type')->default(1);
            $table->text('reason')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('revoke_reason')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id', 'idx_trust_grants_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trust_grants');
        Schema::dropIfExists('contributor_profiles');
        Schema::dropIfExists('summary_requests');
        Schema::dropIfExists('suggestion_votes');
        Schema::dropIfExists('suggestions');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('notifications');
    }
};
