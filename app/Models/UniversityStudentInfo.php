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

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function college()
    {
        return $this->belongsTo(College::class);
    }

    public function major()
    {
        return $this->belongsTo(Major::class);
    }
}
