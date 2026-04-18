<?php

// Resolve the frontend URL safely — avoids env() inside array which can crash artisan
$frontendUrl = env('FRONTEND_URL', '');

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_merge(
        [
            // Local development
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://10.31.55.147:3000',
            'http://10.112.220.147:3000',
            'http://192.168.0.207:3000',
            'http://192.168.8.103:3000',
            'http://192.168.0.101:3000',
            'http://192.168.0.103:3000',
        ],
        // Add production Vercel URL only if the env var is set
        $frontendUrl ? [$frontendUrl] : []
    ))),

    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',  // Allow all Vercel preview deployments
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
