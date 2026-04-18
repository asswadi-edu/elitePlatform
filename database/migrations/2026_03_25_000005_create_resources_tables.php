<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Resources (ملفات تعليمية)
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            // 1=ملخص | 2=شرح | 3=امتحان سابق | 4=واجب | 5=أخرى
            $table->tinyInteger('resource_type')->default(1);
            $table->string('file_url', 500);
            $table->string('file_name', 255)->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('dislikes_count')->default(0);
            $table->unsignedInteger('downloads_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index('subject_id', 'idx_resources_subject');
            $table->index('user_id', 'idx_resources_user');
            $table->index(['is_approved', 'resource_type'], 'idx_resources_approved_type');
        });

        // Resource Votes (likes/dislikes)
        Schema::create('resource_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('resource_id')->constrained('resources')->cascadeOnDelete();
            // 1=like | -1=dislike
            $table->tinyInteger('vote_type');
            $table->timestamps();

            $table->unique(['user_id', 'resource_id'], 'uq_resource_votes');
        });

        // Resource Downloads (سجل التنزيلات)
        Schema::create('resource_downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resource_id')->constrained('resources')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('resource_id', 'idx_downloads_resource');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_downloads');
        Schema::dropIfExists('resource_votes');
        Schema::dropIfExists('resources');
    }
};
