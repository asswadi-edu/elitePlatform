<?php
$file = __DIR__ . '/test_image.png';
file_put_contents($file, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='));

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/profile/upload-avatar");
curl_setopt($ch, CURLOPT_POST, 1);
$cfile = new CURLFile($file, 'image/png', 'test_image.png');
curl_setopt($ch, CURLOPT_POSTFIELDS, ['avatar' => $cfile]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpcode\n";
echo "Response: $response\n";
