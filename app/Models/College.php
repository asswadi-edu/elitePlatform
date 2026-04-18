<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class College extends Model
{
    use HasAuditLog;
    protected $fillable = ['uuid', 'name', 'field_id'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }


    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function majors()
    {
        return $this->hasMany(Major::class);
    }
}
