<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModeratorLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'moderator_id',
        'action_type',
        'target_type',
        'target_id',
        'note',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    public function target()
    {
        return $this->morphTo();
    }
}
