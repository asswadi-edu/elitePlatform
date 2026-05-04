<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Temporary routes for clearing cache on hosting
Route::get('/ping', function() {
    die("Routing is working! (Ping Successful)");
});

Route::get('/clear-config', function() {
    try {
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');
        \Illuminate\Support\Facades\Artisan::call('route:clear');
        die("All cache cleared successfully!");
    } catch (\Exception $e) {
        die("Error during clearing: " . $e->getMessage());
    }
});

Route::get('/test-email', function() {
    try {
        \Illuminate\Support\Facades\Mail::raw('Test email from hosting.', function ($message) {
            $message->to('asswadi.edu@gmail.com')
                    ->subject('SMTP Connection Test');
        });
        die("Email sent successfully!");
    } catch (\Exception $e) {
        die("Mail Error: " . $e->getMessage());
    }
});
