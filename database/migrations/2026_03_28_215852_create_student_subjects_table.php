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
        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('study_level'); // 1, 2, 3...
            $table->tinyInteger('semester');    // 1, 2
            $table->string('academic_year', 20); // e.g. "2024/2025"
            $table->timestamps();

            $table->unique(['user_id', 'subject_id', 'study_level', 'semester'], 'user_subject_term_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_subjects');
    }
};
