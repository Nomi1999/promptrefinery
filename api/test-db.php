<?php
// Test file to verify database setup and connectivity
// This file can be temporarily used to test the backend infrastructure

require_once '../config/database.php';

// Simple test to verify database is working
try {
    $stmt = $database->prepare("SELECT COUNT(*) as user_count FROM users");
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'user_count' => $row['user_count'],
        'database_path' => realpath('../data/users.db')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database test failed: ' . $e->getMessage()
    ]);
}
?>