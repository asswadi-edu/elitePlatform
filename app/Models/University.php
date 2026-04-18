<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class University extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes, HasAuditLog;

    protected $fillable = ['uuid', 'name', 'type', 'city', 'is_active'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

    /*
    public function colleges()
    {
        return $this->hasMany(College::class);
    }
    */
}
