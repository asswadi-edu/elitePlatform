<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiQuizAttempt extends Model
{
    protected $fillable = [
        'uuid',
        'ai_quiz_id',
        'user_id',
        'score',
        'answers_json',
        'time_taken',
    ];

    protected $casts = [
        'answers_json' => 'array',
    ];

    public function quiz()
    {
        return $this->belongsTo(AiQuiz::class, 'ai_quiz_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
