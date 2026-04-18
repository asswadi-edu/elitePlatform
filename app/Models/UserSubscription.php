<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class UserSubscription extends Model
{
    use HasFactory, HasAuditLog;

    protected $fillable = [
        'user_id',
        'plan_id',
        'activation_card_id',
        'status',
        'starts_at',
        'ends_at',
        'activated_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    protected $appends = ['masked_code'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function activationCard()
    {
        return $this->belongsTo(ActivationCard::class, 'activation_card_id');
    }

    public function getMaskedCodeAttribute()
    {
        if (!$this->relationLoaded('activationCard') || !$this->activationCard) {
            return null;
        }

        $full = $this->activationCard->full_code;
        $suffix = $this->activationCard->code_suffix;

        if ($full && str_contains($full, '-')) {
            $parts = explode('-', $full);
            if (count($parts) === 4) {
                return $parts[0] . "-" . $parts[1] . "-****-" . $parts[3];
            }
        }

        return "NKBH-****-****-" . $suffix;
    }
}
