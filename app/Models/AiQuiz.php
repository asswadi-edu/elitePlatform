<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiQuiz extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'subject',
        'file_name',
        'num_questions',
        'difficulty',
        'questions_json',
        'time_limit',
    ];

    protected $casts = [
        'questions_json' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attempts()
    {
        return $this->hasMany(AiQuizAttempt::class);
    }

    public function latestAttempt()
    {
        return $this->hasOne(AiQuizAttempt::class)->latestOfMany();
    }
}
