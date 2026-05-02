<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clear permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define all necessary permissions for subscribers
        $permissions = [
            'access_ai_quizzes',
            'access_challenges',
            'participate_challenges',
            'manage_paid_subjects',
            'take_aptitude_test',
            'view_resources',
            'view_majors',
            'view_challenges',
            'view_announcements',
            'upload_resources',
            'manage_my_resources',
            'manage_my_quizzes',
            'view dashboard',
            'view_academic_content'
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // 2. Ensure 'subscriber' role exists
        $subscriberRole = Role::findOrCreate('subscriber', 'web');
        
        // 3. Assign permissions to subscriber
        $subscriberRole->syncPermissions($permissions);

        // 4. Ensure base roles also have basic student permissions
        $baseStudentPermissions = [
            'take_aptitude_test',
            'view_resources',
            'view_majors',
            'view_challenges',
            'view_announcements',
            'view_academic_content'
        ];
        
        $studentSchool = Role::where('name', 'student_school')->first();
        if ($studentSchool) {
            $studentSchool->givePermissionTo($baseStudentPermissions);
        }

        $studentUni = Role::where('name', 'student_university')->first();
        if ($studentUni) {
            $studentUni->givePermissionTo($baseStudentPermissions);
        }

        // 5. Ensure Admin has everything
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($permissions);
        }

        // Reset permission cache again after changes
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversing permission assignments in migrations is usually not necessary
    }
};
