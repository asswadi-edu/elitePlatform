<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class UserPoints extends Model
{
    use HasFactory, HasAuditLog;

    protected $fillable = [
        'user_id',
        'balance',
        'total_earned',
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
