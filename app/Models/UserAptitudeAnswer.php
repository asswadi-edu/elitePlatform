<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAptitudeAnswer extends Model
{
    protected $guarded = [];
    public $timestamps = false;

    public function attempt()
    {
        return $this->belongsTo(UserAptitudeAttempt::class, 'attempt_id');
    }

    public function question()
    {
        return $this->belongsTo(AptitudeQuestion::class);
    }
}
