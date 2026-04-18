<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait HasAuditLog
{
    public static function bootHasAuditLog()
    {
        static::created(function ($model) {
            $model->logAudit('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $oldValues = array_intersect_key($model->getOriginal(), $model->getDirty());
            $newValues = $model->getDirty();
            
            // Don't log if only timestamps changed
            unset($oldValues['updated_at'], $newValues['updated_at']);
            
            if (!empty($newValues)) {
                $model->logAudit('updated', $oldValues, $newValues);
            }
        });

        static::deleted(function ($model) {
            $model->logAudit('deleted', $model->getAttributes(), null);
        });
    }

    protected function logAudit($action, $oldValues = null, $newValues = null)
    {
        $metadata = [];
        $targetUserId = null;

        // Try to get a target user ID if the model has one
        if (isset($this->user_id)) {
            $targetUserId = $this->user_id;
        } elseif ($this instanceof \App\Models\User) {
            $targetUserId = $this->id;
        }

        // Capture a descriptive title or name for the metadata
        if (isset($this->title)) {
            $metadata['title'] = $this->title;
        } elseif (isset($this->name)) {
            $metadata['title'] = $this->name;
        }

        // Special handling for approval status changes
        if ($action === 'updated' && isset($newValues['is_approved'])) {
            if ($newValues['is_approved'] == 1) {
                $action = 'approved';
            } elseif ($newValues['is_approved'] == 0 && isset($oldValues['is_approved']) && $oldValues['is_approved'] == 1) {
                $action = 'unapproved';
            }
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'target_user_id' => $targetUserId,
            'action' => $action,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'metadata' => !empty($metadata) ? $metadata : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
