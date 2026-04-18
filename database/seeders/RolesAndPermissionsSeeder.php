<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Clear tables carefully
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create Permissions
        $permissions = [
            'manage users',
            'manage academic',
            'manage subscriptions',
            'manage settings',
            'manage challenges',
            'manage resources',
            'manage reports',
            'manage suggestions',
            'view dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create Roles and Assign Permissions
        
        // Admin: Everything
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->givePermissionTo(Permission::all());

        // Moderator: Most things except system settings and user management
        $moderatorRole = Role::firstOrCreate(['name' => 'moderator', 'guard_name' => 'web']);
        $moderatorRole->givePermissionTo([
            'manage academic',
            'manage subscriptions',
            'manage challenges',
            'manage resources',
            'manage reports',
            'manage suggestions',
            'view dashboard',
        ]);

        // Student (School/General)
        $studentSchoolRole = Role::firstOrCreate(['name' => 'student_school', 'guard_name' => 'web']);

        // Student (University)
        $studentUniRole = Role::firstOrCreate(['name' => 'student_university', 'guard_name' => 'web']);

        $this->command->info('Roles and permissions wiped and re-seeded successfully.');
    }
}
