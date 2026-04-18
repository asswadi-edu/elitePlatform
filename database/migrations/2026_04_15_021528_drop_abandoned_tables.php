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
        // Drop abandoned/orphaned tables
        Schema::dropIfExists('contributor_profiles');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('quiz_jobs');
        Schema::dropIfExists('suggestion_votes');
        Schema::dropIfExists('resource_downloads');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-creating them is omitted since they are functionally abandoned.
        // It's meant as a cleanup migration.
    }
};
