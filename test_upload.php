<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::first(); // Just get a user, but let's make sure it's a student
$user = \App\Models\User::role('subscriber')->first();
if (!$user) {
    $user = \App\Models\User::first();
    if ($user) $user->assignRole('subscriber');
}

if ($user) {
    $token = $user->createToken('test_token')->plainTextToken;
    echo "Testing with token: $token\n";
    
    // Simulate API request to upload resource
    $client = new \GuzzleHttp\Client(['verify' => false]);
    try {
        $response = $client->post('http://127.0.0.1:8000/api/resources', [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Accept' => 'application/json'
            ],
            'multipart' => [
                ['name' => 'title', 'contents' => 'Test Resource'],
                ['name' => 'subject_id', 'contents' => '1'],
                ['name' => 'resource_type', 'contents' => '1'],
                ['name' => 'is_anonymous', 'contents' => '0'],
                ['name' => 'file', 'contents' => 'dummy content', 'filename' => 'test.pdf']
            ]
        ]);
        echo "Response Status: " . $response->getStatusCode() . "\n";
        echo "Response Body: " . $response->getBody() . "\n";
    } catch (\GuzzleHttp\Exception\ClientException $e) {
        echo "Error Status: " . $e->getResponse()->getStatusCode() . "\n";
        echo "Error Body: " . $e->getResponse()->getBody() . "\n";
    }
}
