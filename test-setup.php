<?php
// Simple test script to verify registration functionality
require_once 'config/database.php';

// Test data
$username = 'testuser';
$email = 'test@example.com';
$password = 'TestPass123!';

// Hash password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Insert test user
$stmt = $database->prepare("INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)");
$result = $stmt->execute([$username, $email, $passwordHash]);

if ($result) {
    echo "Test setup completed successfully!\n";
    
    // Verify user exists
    $checkStmt = $database->prepare("SELECT COUNT(*) as count FROM users WHERE username = ?");
    $checkResult = $checkStmt->execute([$username]);
    $row = $checkResult->fetchArray(SQLITE3_ASSOC);
    
    echo "Users in database: " . $row['count'] . "\n";
} else {
    echo "Test setup failed: " . $database->lastErrorMsg() . "\n";
}
?>