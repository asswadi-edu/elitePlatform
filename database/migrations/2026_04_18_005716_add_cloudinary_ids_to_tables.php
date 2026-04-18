<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add cloudinary_avatar_id to user_profiles
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('cloudinary_avatar_id')->nullable()->after('avatar_url');
        });

        // Add cloudinary_image_id to majors
        Schema::table('majors', function (Blueprint $table) {
            $table->string('cloudinary_image_id')->nullable()->after('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn('cloudinary_avatar_id');
        });

        Schema::table('majors', function (Blueprint $table) {
            $table->dropColumn('cloudinary_image_id');
        });
    }
};
