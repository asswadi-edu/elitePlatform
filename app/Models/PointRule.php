<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class PointRule extends Model
{
    use HasAuditLog;
    protected $guarded = [];
}
