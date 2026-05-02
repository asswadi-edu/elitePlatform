<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$roles = \Spatie\Permission\Models\Role::with('permissions')->get();
$result = [];
foreach($roles as $role) {
    $result[$role->name] = $role->permissions->pluck('name');
}
echo json_encode($result, JSON_PRETTY_PRINT);
