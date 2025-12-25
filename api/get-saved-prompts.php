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
    
    // Get total count of saved prompts for this user
    $countStmt = $database->prepare("SELECT COUNT(*) as count FROM saved_prompts WHERE user_id = :user_id");
    $countStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $countResult = $countStmt->execute();
    $countData = $countResult->fetchArray(SQLITE3_ASSOC);
    $count = $countData['count'];
    
    // Fetch all saved prompts for this user, ordered by created_at DESC (newest first)
    $stmt = $database->prepare("SELECT id, original_prompt, enhanced_prompt, notes, created_at FROM saved_prompts WHERE user_id = :user_id ORDER BY created_at DESC");
    $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $prompts = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $prompts[] = $row;
    }
    
    sendJsonResponse([
        'prompts' => $prompts,
        'count' => $count,
        'limit' => 100
    ], 200);
    
} catch (Exception $e) {
    error_log('Get saved prompts error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Load failed'], 500);
}
