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
        Schema::table('resources', function (Blueprint $table) {
            $table->string('platform', 100)->nullable()->after('resource_type');
            $table->string('duration', 50)->nullable()->after('platform');
            $table->unsignedInteger('clicks')->default(0)->after('downloads_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            //
        });
    }
};
