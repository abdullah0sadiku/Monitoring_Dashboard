<?php
// Test script for PHP backend
echo "Testing PHP Backend...\n";

// Test database connection
try {
    require_once 'backend/config/database.php';
    echo "✅ Database connection successful\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Test file upload directory
$uploadDir = 'backend/uploads/monitors/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
    echo "✅ Created upload directory\n";
} else {
    echo "✅ Upload directory exists\n";
}

// Test data directory
$dataDir = 'backend/data/';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
    echo "✅ Created data directory\n";
} else {
    echo "✅ Data directory exists\n";
}

echo "\nPHP Backend is ready!\n";
echo "You can now start your PHP server and test the API endpoints.\n";
echo "\nTo start the server, run: php -S localhost:3001 -t backend\n";
echo "Then test with: curl http://localhost:3001/api/health\n";
?> 