<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAuditLog;

class Suggestion extends Model
{
    use HasFactory, SoftDeletes, HasAuditLog;

    protected $fillable = [
        'uuid',
        'user_id',
        'category',
        'title',
        'description',
        'status',
        'admin_response',
        'upvotes_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
