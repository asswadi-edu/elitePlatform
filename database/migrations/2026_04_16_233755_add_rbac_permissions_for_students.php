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
        // Define base permissions
        $permissions = [
            'access_challenges',
            'access_ai_quizzes',
            'manage_free_subjects',
            'manage_paid_subjects',
            'take_aptitude_test',
            'upload_resources',
            'view dashboard',
            'view majors',
            'view suggestions'
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Create subscriber role
        $subscriberRole = Role::findOrCreate('subscriber', 'web');
        
        // Ensure student roles exist
        $schoolRole = Role::findOrCreate('student_school', 'web');
        $universityRole = Role::findOrCreate('student_university', 'web');

        // Assign permissions to School role
        $schoolRole->givePermissionTo(['take_aptitude_test', 'view dashboard', 'view majors', 'view suggestions']);

        // Assign permissions to University role
        $universityRole->givePermissionTo([
            'take_aptitude_test', 
            'manage_free_subjects', 
            'upload_resources',
            'view dashboard',
            'view majors',
            'view suggestions'
        ]);

        // Assign permissions to Subscriber role
        $subscriberRole->givePermissionTo([
            'access_challenges',
            'access_ai_quizzes',
            'manage_paid_subjects'
        ]);
        
        // Ensure Admin has all
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->syncPermissions(Permission::all());
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Do not delete permissions on reverse to prevent breaking existing code
    }
};
