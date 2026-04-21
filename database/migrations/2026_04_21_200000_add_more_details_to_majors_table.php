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
            $table->json('acquired_skills')->nullable();
            $table->json('workplaces')->nullable();
            $table->json('in_demand_jobs')->nullable();
            $table->json('sustaining_skills')->nullable();
            $table->text('future_of_major')->nullable();
            $table->text('why_choose_major')->nullable();
            $table->text('when_not_suitable')->nullable();
            $table->text('global_opportunities')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('majors', function (Blueprint $table) {
            $table->dropColumn([
                'acquired_skills',
                'workplaces',
                'in_demand_jobs',
                'sustaining_skills',
                'future_of_major',
                'why_choose_major',
                'when_not_suitable',
                'global_opportunities'
            ]);
        });
    }
};
