<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('first_name', 60);
            $table->string('father_name', 60);
            $table->string('grandfather_name', 60);
            $table->string('last_name', 60);
            $table->string('phone', 20)->nullable();
            $table->string('avatar_url', 500)->nullable();
            // 1=male | 2=female
            $table->tinyInteger('gender')->nullable();
            $table->date('birth_date')->nullable();
            $table->text('bio')->nullable();
            // will be set after major selection
            $table->unsignedBigInteger('major_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
