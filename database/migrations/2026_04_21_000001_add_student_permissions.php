<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    public function up(): void
    {
        // Clear permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create missing student permissions
        $studentPermissions = [
            'take_aptitude_test',
            'view_resources',
            'view_majors',
            'view_challenges',
            'view_announcements',
        ];

        foreach ($studentPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Assign to student roles
        $studentSchool = Role::where('name', 'student_school')->first();
        $studentUni    = Role::where('name', 'student_university')->first();

        if ($studentSchool) {
            $studentSchool->givePermissionTo($studentPermissions);
        }

        if ($studentUni) {
            $studentUni->givePermissionTo($studentPermissions);
        }

        // Reset permission cache again after changes
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        $permissions = [
            'take_aptitude_test',
            'view_resources',
            'view_majors',
            'view_challenges',
            'view_announcements',
        ];

        foreach ($permissions as $perm) {
            $p = Permission::where('name', $perm)->first();
            if ($p) $p->delete();
        }
    }
};
