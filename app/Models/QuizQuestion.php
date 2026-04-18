<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'quiz_id',
        'question_text',
        'question_type',
        'correct_answer',
        'explanation',
        'display_order',
        'created_at'
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function options()
    {
        return $this->hasMany(QuestionOption::class, 'question_id');
    }
}
