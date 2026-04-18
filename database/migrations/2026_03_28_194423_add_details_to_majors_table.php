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
        Schema::table('majors', function (Blueprint $table) {
            $table->json('core_subjects')->nullable()->after('description');
            $table->json('required_skills')->nullable()->after('core_subjects');
            $table->string('duration', 50)->nullable()->after('required_skills');
            $table->string('degree_type', 100)->nullable()->after('duration');
            $table->string('study_nature', 100)->nullable()->after('degree_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('majors', function (Blueprint $table) {
            $table->dropColumn(['core_subjects', 'required_skills', 'duration', 'degree_type', 'study_nature']);
        });
    }
};
