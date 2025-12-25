<?php
require_once '../config/database.php';
require_once 'auth-helpers.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required field
if (!isset($input['prompt_id'])) {
    sendJsonResponse(['error' => 'Prompt ID is required'], 400);
}

$promptId = (int)$input['prompt_id'];

// Validate prompt ID
if ($promptId <= 0) {
    sendJsonResponse(['error' => 'Invalid prompt ID'], 400);
}

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }
    
    // First check if user owns this prompt (security check)
    $checkStmt = $database->prepare("SELECT id FROM saved_prompts WHERE id = :prompt_id AND user_id = :user_id");
    $checkStmt->bindValue(':prompt_id', $promptId, SQLITE3_INTEGER);
    $checkStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $checkResult = $checkStmt->execute();
    
    if (!$checkResult->fetchArray(SQLITE3_ASSOC)) {
        sendJsonResponse(['error' => 'Prompt not found or you do not have permission to delete it'], 401);
    }
    
    // Delete the prompt
    $deleteStmt = $database->prepare("DELETE FROM saved_prompts WHERE id = :prompt_id AND user_id = :user_id");
    $deleteStmt->bindValue(':prompt_id', $promptId, SQLITE3_INTEGER);
    $deleteStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    
    if ($deleteStmt->execute()) {
        sendJsonResponse(['message' => 'Prompt deleted successfully'], 200);
    } else {
        sendJsonResponse(['error' => 'Failed to delete prompt'], 500);
    }
    
} catch (Exception $e) {
    error_log('Delete saved prompt error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Delete failed'], 500);
}
