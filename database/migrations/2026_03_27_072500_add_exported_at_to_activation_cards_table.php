<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activation_cards', function (Blueprint $table) {
            $table->timestamp('exported_at')->nullable()->after('expires_at');
            $table->index(['plan_id', 'is_used', 'exported_at'], 'idx_cards_export_filter');
        });
    }

    public function down(): void
    {
        Schema::table('activation_cards', function (Blueprint $table) {
            $table->dropIndex('idx_cards_export_filter');
            $table->dropColumn('exported_at');
        });
    }
};
