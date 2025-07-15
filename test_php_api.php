<?php
// Test the PHP API endpoints
echo "Testing PHP API...\n";

// Test health endpoint
$healthUrl = 'http://localhost:3001/api/health';
echo "Testing health endpoint: $healthUrl\n";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json'
    ]
]);

try {
    $response = file_get_contents($healthUrl, false, $context);
    if ($response !== false) {
        echo "✅ Health endpoint working\n";
        echo "Response: $response\n";
    } else {
        echo "❌ Health endpoint failed\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

// Test monitors endpoint
$monitorsUrl = 'http://localhost:3001/api/monitors';
echo "\nTesting monitors endpoint: $monitorsUrl\n";

try {
    $response = file_get_contents($monitorsUrl, false, $context);
    if ($response !== false) {
        echo "✅ Monitors endpoint working\n";
        $data = json_decode($response, true);
        echo "Monitors count: " . count($data['data'] ?? []) . "\n";
    } else {
        echo "❌ Monitors endpoint failed\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\nPHP API test completed!\n";
?> 