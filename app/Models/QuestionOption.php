<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionOption extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'question_id',
        'option_text',
        'is_correct',
        'display_order'
    ];

    public function question()
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}
