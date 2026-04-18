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
        Schema::table('challenge_participants', function (Blueprint $table) {
            $table->integer('time_spent')->nullable()->after('progress');
            $table->integer('correct_count')->nullable()->after('time_spent');
            $table->json('answers_json')->nullable()->after('correct_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('challenge_participants', function (Blueprint $table) {
            $table->dropColumn(['time_spent', 'correct_count', 'answers_json']);
        });
    }
};
