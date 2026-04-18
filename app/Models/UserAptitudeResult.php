<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAptitudeResult extends Model
{
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
        'suggested_majors' => 'array',
        'raw_ml_response' => 'array',
    ];

    public function attempt()
    {
        return $this->belongsTo(UserAptitudeAttempt::class, 'attempt_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class, 'best_field_id');
    }
}
