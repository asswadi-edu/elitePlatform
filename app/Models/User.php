<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Traits\HasAuditLog;

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use \Laravel\Sanctum\HasApiTokens, HasFactory, Notifiable, HasAuditLog, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'email',
        'password',
        'status',
        'is_trusted',
        'is_university',
        'must_change_password',
        'last_login_at',
        'email_verified_at',
    ];

    protected $appends = ['name', 'role', 'rank', 'user_permissions'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_trusted' => 'boolean',
            'is_university' => 'boolean',
            'must_change_password' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function getRankAttribute()
    {
        $points = $this->points ? (int)$this->points->balance : 0;
        
        // Cache ranks to avoid heavy decoding/querying
        $ranks = \Cache::remember('system_ranks', 3600, function() {
            $value = \DB::table('system_settings')->where('key', 'ranking_system')->value('value');
            return $value ? json_decode($value, true) : [];
        });

        if (empty($ranks)) {
            return [
                'name' => 'طالب',
                'color' => '#6B7280',
                'bg' => '#F3F4F6',
                'borderColor' => '#D1D5DB',
                'useColor' => true,
                'useFrame' => false,
                'frameUrl' => ''
            ];
        }

        // Find the best matching rank (highest minPts that is <= current points)
        $currentRank = null;
        foreach ($ranks as $r) {
            if ($points >= $r['minPts']) {
                if (!$currentRank || $r['minPts'] > $currentRank['minPts']) {
                    $currentRank = $r;
                }
            }
        }

        return $currentRank ?: $ranks[0];
    }

    public function getRoleAttribute()
    {
        // For frontend compatibility, return the first role name
        // Use relationLoaded to check if roles are already there, but Spatie lazy-loads them anyway.
        // We use first() which is safe.
        $role = $this->roles->first();
        return $role ? $role->name : 'student';
    }

    public function getUserPermissionsAttribute()
    {
        return $this->getAllPermissions()->pluck('name');
    }

    public function getNameAttribute()
    {
        // Safely check for profile existence
        if ($this->relationLoaded('profile') && $this->profile) {
            return trim("{$this->profile->first_name} {$this->profile->last_name}");
        }
        
        // If profile exists but not loaded, lazy load it only if needed
        if ($this->profile) {
            return trim("{$this->profile->first_name} {$this->profile->last_name}");
        }

        return $this->email ?: "المستخدم #{$this->id}";
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function points()
    {
        return $this->hasOne(UserPoints::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(UserSubscription::class)
                    ->where('status', 1)
                    ->where('ends_at', '>=', now())
                    ->latest();
    }

    public function resources()
    {
        return $this->hasMany(Resource::class);
    }

    public function universityInfo()
    {
        return $this->hasOne(UniversityStudentInfo::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class)->latest();
    }

    /**
     * Override default email verification notification
     */
    public function sendEmailVerificationNotification()
    {
        // Handled manually via OTP in AuthController
    }
}
