<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'uni_student@elite.com')->first();
$user->load(['universityInfo.major']);

echo json_encode($user->toArray(), JSON_PRETTY_PRINT);
