<?php
require_once '../config/database.php';
require_once 'auth-helpers.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }
    
    // Get user profile information
    $stmt = $database->prepare("SELECT id, username, email, created_at FROM users WHERE id = :user_id");
    $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $user = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$user) {
        sendJsonResponse(['error' => 'User not found'], 404);
    }
    
    // Get count of saved prompts for this user
    $countStmt = $database->prepare("SELECT COUNT(*) as count FROM saved_prompts WHERE user_id = :user_id");
    $countStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $countResult = $countStmt->execute();
    $countData = $countResult->fetchArray(SQLITE3_ASSOC);
    
    $user['saved_prompts_count'] = $countData['count'];
    
    sendJsonResponse($user, 200);
    
} catch (Exception $e) {
    error_log('Get profile error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Profile load failed'], 500);
}
