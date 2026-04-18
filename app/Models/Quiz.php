<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'subject_id',
        'subject_name',
        'ai_job_id',
        'source_file_url',
        'source_file_name',
        'num_questions',
        'time_limit',
        'difficulty',
        'is_challenge_quiz',
        'challenge_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function challenge()
    {
        return $this->belongsTo(Challenge::class, 'challenge_id');
    }
}
