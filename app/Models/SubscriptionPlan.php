<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class SubscriptionPlan extends Model
{
    use HasAuditLog;
    protected $guarded = [];
}
