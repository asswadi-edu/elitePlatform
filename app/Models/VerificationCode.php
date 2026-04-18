<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationCode extends Model
{
    protected $fillable = ['email', 'code', 'type', 'expires_at'];

    public static function generateFor($email, $type)
    {
        // Throttling: Check if a code was sent in the last 60 seconds
        $existing = self::where('email', $email)
            ->where('type', $type)
            ->where('created_at', '>', now()->subSeconds(60))
            ->first();

        if ($existing) {
            throw new \Exception("يرجى الانتظار 60 ثانية قبل طلب رمز جديد.");
        }

        // Delete old codes of this type
        self::where('email', $email)->where('type', $type)->delete();

        return self::create([
            'email' => $email,
            'code' => sprintf("%06d", mt_rand(1, 999999)),
            'type' => $type,
            'expires_at' => now()->addMinutes(15),
        ]);
    }
}
