<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAuditLog;

class Challenge extends Model
{
    use HasFactory, SoftDeletes, HasAuditLog;

    protected $fillable = [
        'uuid',
        'title',
        'description',
        'subject_id',
        'created_by',
        'quiz_id',
        'status',
        'max_participants',
        'difficulty',
        'num_questions',
        'start_at',
        'end_at',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'challenge_participants')
            ->withPivot(['joined_at', 'status', 'score', 'progress', 'time_spent', 'correct_count', 'answers_json'])
            ->withTimestamps();
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }
}
