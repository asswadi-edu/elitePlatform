<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    \Illuminate\Support\Facades\Mail::raw('Test email from local server.', function ($message) {
        $message->to('asswadi.edu@gmail.com')
                ->subject('SMTP Connection Test');
    });
    echo "Email sent successfully.\n";
} catch (\Exception $e) {
    echo "Mail Error: " . $e->getMessage() . "\n";
}
