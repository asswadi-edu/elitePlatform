<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('university_student_info')->truncate();
        DB::table('user_profiles')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $users = [
            [
                'email' => 'admin@elite.com',
                'password' => 'admin123',
                'role_spatie' => 'admin',
                'first_name' => 'مدير',
                'last_name' => 'المنصة',
                'is_university' => false,
            ],
            [
                'email' => 'mod@elite.com',
                'password' => 'mod123',
                'role_spatie' => 'moderator',
                'first_name' => 'مشرف',
                'last_name' => 'المحتوى',
                'is_university' => false,
            ],
            [
                'email' => 'student@elite.com',
                'password' => 'student123',
                'role_spatie' => 'student_school',
                'first_name' => 'طالب',
                'last_name' => 'مدرسة',
                'is_university' => false,
            ],
            [
                'email' => 'uni_student@elite.com',
                'password' => 'student123',
                'role_spatie' => 'student_university',
                'first_name' => 'طالب',
                'last_name' => 'جامعي',
                'is_university' => true,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::create([
                'uuid' => (string) Str::uuid(),
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'status' => 1,
                'is_university' => $userData['is_university'],
                'email_verified_at' => now(),
            ]);

            $user->assignRole($userData['role_spatie']);

            UserProfile::create([
                'user_id' => $user->id,
                'first_name' => $userData['first_name'],
                'father_name' => '-',
                'grandfather_name' => '-',
                'last_name' => $userData['last_name'],
                'gender' => 1
            ]);

            if ($userData['is_university']) {
                \App\Models\UniversityStudentInfo::create([
                    'user_id' => $user->id,
                    'university_id' => 1,
                    // If CollegeSeeder provides ID 1, we can link it
                    'college_id' => 1,
                    'major_id' => 1,
                    'academic_number' => 'ELITE-' . rand(1000, 9999),
                    'study_level' => 1,
                ]);
            }
        }
    }
}
