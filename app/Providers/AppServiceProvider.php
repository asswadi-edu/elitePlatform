<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . $user->email;
        });

        VerifyEmail::createUrlUsing(function ($user) {
            $id = $user->getKey();
            $hash = sha1($user->getEmailForVerification());
            return config('app.frontend_url') . "/verify-email?id={$id}&hash={$hash}";
        });
    }
}
