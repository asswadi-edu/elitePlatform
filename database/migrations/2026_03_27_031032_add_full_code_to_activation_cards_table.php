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
        Schema::table('activation_cards', function (Blueprint $table) {
            $table->string('full_code', 20)->after('code_hash')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('activation_cards', function (Blueprint $table) {
            $table->dropColumn('full_code');
        });
    }
};
