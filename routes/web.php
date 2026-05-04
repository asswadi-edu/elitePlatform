<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Temporary routes for clearing cache on hosting
Route::get('/clear-config', function() {
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    return "All cache cleared successfully!";
});

Route::get('/test-email', function() {
    try {
        \Illuminate\Support\Facades\Mail::raw('Test email from hosting.', function ($message) {
            $message->to('asswadi.edu@gmail.com')
                    ->subject('SMTP Connection Test');
        });
        return "Email sent successfully!";
    } catch (\Exception $e) {
        return "Mail Error: " . $e->getMessage();
    }
});
