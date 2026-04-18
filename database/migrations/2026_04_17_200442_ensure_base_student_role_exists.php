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
        // Enforce guard_name to avoid issues
        $guard = 'web';

        // Create the base 'student' role as a fallback
        $studentRole = Role::findOrCreate('student', $guard);

        // Assign base student permissions (same as student_school)
        $studentRole->syncPermissions([
            'take_aptitude_test', 
            'view dashboard', 
            'view majors', 
            'view suggestions'
        ]);
        
        // Also ensure roles are mapped correctly for existing users if any
        // But for now, we just ensure the role exists to prevent crashes
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op to prevent data loss
    }
};
