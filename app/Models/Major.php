<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasAuditLog;

class Major extends Model
{
    use HasAuditLog;
    protected $fillable = [
        'uuid', 'name', 'job_title', 'image_url', 'college_id', 'field_id', 'description', 
        'careers', 'is_active',
        'core_subjects', 'required_skills', 'duration', 'degree_type', 'study_nature'
    ];

    protected $casts = [
        'careers' => 'array',
        'job_title' => 'array',
        'core_subjects' => 'array',
        'required_skills' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function college()
    {
        return $this->belongsTo(College::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
}
