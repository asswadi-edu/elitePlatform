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
        Schema::table('university_student_info', function (Blueprint $table) {
            $table->foreignId('college_id')->nullable()->after('university_id')->constrained('colleges')->nullOnDelete();
            $table->index('college_id', 'idx_usi_college');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('university_student_info', function (Blueprint $table) {
            $table->dropForeign(['college_id']);
            $table->dropColumn('college_id');
        });
    }
};
