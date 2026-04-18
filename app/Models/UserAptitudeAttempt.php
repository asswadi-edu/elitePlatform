<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserAptitudeAttempt extends Model
{
    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(AptitudeTest::class);
    }

    public function answers()
    {
        return $this->hasMany(UserAptitudeAnswer::class, 'attempt_id');
    }

    public function result()
    {
        return $this->hasOne(UserAptitudeResult::class, 'attempt_id');
    }
}
