<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniversityStudentInfo extends Model
{
    protected $table = 'university_student_info';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
