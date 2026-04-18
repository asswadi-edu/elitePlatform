<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop university_id from colleges
        if (Schema::hasColumn('colleges', 'university_id')) {
            Schema::table('colleges', function (Blueprint $table) {
                // Ignore errors if foreign key doesn't exist
                try {
                    $table->dropForeign(['university_id']);
                } catch (\Exception $e) {}
                
                try {
                    $table->dropIndex('idx_colleges_university');
                } catch (\Exception $e) {}

                $table->dropColumn('university_id');
            });
        }

        // 2. Drop major_id from user_profiles
        if (Schema::hasColumn('user_profiles', 'major_id')) {
            Schema::table('user_profiles', function (Blueprint $table) {
                $table->dropColumn('major_id');
            });
        }

        // 3. Drop full_code from activation_cards
        if (Schema::hasColumn('activation_cards', 'full_code')) {
            Schema::table('activation_cards', function (Blueprint $table) {
                $table->dropColumn('full_code');
            });
        }

        // 4. Drop inactive tables
        if (Schema::hasTable('resource_votes')) {
            Schema::dropIfExists('resource_votes');
        }

        if (Schema::hasTable('challenge_submissions')) {
            Schema::dropIfExists('challenge_submissions');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversals
        Schema::table('colleges', function (Blueprint $table) {
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->index('university_id', 'idx_colleges_university');
        });

        Schema::table('user_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('major_id')->nullable();
        });

        Schema::table('activation_cards', function (Blueprint $table) {
            $table->string('full_code', 20)->nullable();
        });
    }
};
