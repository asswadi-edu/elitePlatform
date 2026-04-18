<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class Subject extends Model
{
    use HasAuditLog;
    protected $fillable = ['uuid', 'name', 'code', 'major_id', 'is_free', 'credit_hours', 'is_active'];

    protected $casts = [
        'is_free' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function major()
    {
        return $this->belongsTo(Major::class);
    }
}
