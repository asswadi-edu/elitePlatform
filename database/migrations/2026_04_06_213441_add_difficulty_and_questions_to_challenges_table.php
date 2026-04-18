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
        Schema::table('challenges', function (Blueprint $table) {
            // 1=simple | 2=medium | 3=hard
            $table->tinyInteger('difficulty')->default(2)->after('quiz_id');
            // 10 | 20 | 30 | 40
            $table->tinyInteger('num_questions')->default(20)->after('difficulty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->dropColumn(['difficulty', 'num_questions']);
        });
    }
};
