<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class ActivationCard extends Model
{
    use HasFactory, HasAuditLog;

    protected $fillable = [
        'code_hash',
        'full_code',
        'code_suffix',
        'plan_id',
        'price',
        'batch_id',
        'generated_by',
        'is_used',
        'used_by',
        'used_at',
        'expires_at',
        'exported_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
        'exported_at' => 'datetime',
    ];

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'used_by');
    }
}
