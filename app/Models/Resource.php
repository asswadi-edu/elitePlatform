<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAuditLog;

class Resource extends Model
{
    use HasFactory, SoftDeletes, HasAuditLog;

    protected $fillable = [
        'uuid',
        'title',
        'description',
        'subject_id',
        'user_id',
        'resource_type',
        'file_url',
        'file_name',
        'file_size',
        'mime_type',
        'doctor',
        'is_anonymous',
        'is_approved',
        'approved_by',
        'approved_at',
        'likes_count',
        'dislikes_count',
        'downloads_count',
        'clicks',
        'platform',
        'duration',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
        'clicks' => 'integer',
        'likes_count' => 'integer',
        'dislikes_count' => 'integer',
        'downloads_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
