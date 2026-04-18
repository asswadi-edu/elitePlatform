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
        Schema::table('aptitude_tests', function (Blueprint $table) {
            $table->integer('time_limit')->nullable()->after('is_active')->comment('Time limit in minutes, null for unlimited');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aptitude_tests', function (Blueprint $table) {
            $table->dropColumn('time_limit');
        });
    }
};
