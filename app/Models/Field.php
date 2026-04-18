<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    protected $fillable = ['uuid', 'name', 'icon_key', 'color_hex', 'description', 'display_order'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function colleges()
    {
        return $this->hasMany(College::class);
    }

    public function majors()
    {
        return $this->hasMany(Major::class);
    }
}
