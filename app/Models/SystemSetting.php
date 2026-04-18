<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class SystemSetting extends Model
{
    use HasAuditLog;
    protected $guarded = [];
    public $timestamps = false;
}
