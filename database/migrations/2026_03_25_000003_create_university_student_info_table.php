<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Complete university student profile
        Schema::create('university_student_info', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->foreignId('major_id')->nullable()->constrained('majors')->nullOnDelete();
            $table->string('academic_number', 50)->nullable();
            // 1-8 (المستوى الأول → الثامن)
            $table->tinyInteger('study_level')->default(1);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index('university_id', 'idx_usi_university');
            $table->index('major_id', 'idx_usi_major');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('university_student_info');
    }
};
