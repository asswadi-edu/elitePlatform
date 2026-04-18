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
        // 1. Define missing permissions
        $permissions = [
            'access_ai_quizzes',
            'access_challenges',
            'upload_resources',
            'manage_paid_subjects',
            'view dashboard',
            'view_academic_content',
            'manage_my_resources',
            'manage_my_quizzes',
            'participate_challenges'
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::findOrCreate($permission, 'web');
        }

        // 2. Assign to Subscriber role
        $subscriberRole = \Spatie\Permission\Models\Role::findOrCreate('subscriber', 'web');
        
        $subscriberRole->givePermissionTo($permissions);

        // 3. Ensure Admin also has them
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($permissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversing is not recommended for permission assignments in migrations
    }
};
