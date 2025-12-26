<?php
require_once '../config/database.php';
require_once 'auth-helpers.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['prompt_id'])) {
    sendJsonResponse(['error' => 'Prompt ID is required'], 400);
}

$promptId = intval($input['prompt_id']);
$customTitle = isset($input['custom_title']) ? trim($input['custom_title']) : '';

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }

    // Validate title length
    if (strlen($customTitle) > 100) {
        sendJsonResponse(['error' => 'Title must be 100 characters or less'], 400);
    }

    // Verify prompt exists and belongs to user
    $checkStmt = $database->prepare("SELECT id FROM saved_prompts WHERE id = :id AND user_id = :user_id");
    $checkStmt->bindValue(':id', $promptId, SQLITE3_INTEGER);
    $checkStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $result = $checkStmt->execute();

    if (!$result->fetchArray()) {
        sendJsonResponse(['error' => 'Prompt not found'], 404);
    }

    // Update title in database (allow empty string to clear title)
    $updateStmt = $database->prepare("UPDATE saved_prompts SET title = :title WHERE id = :id AND user_id = :user_id");
    $updateStmt->bindValue(':title', $customTitle ?: null, SQLITE3_TEXT);
    $updateStmt->bindValue(':id', $promptId, SQLITE3_INTEGER);
    $updateStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);

    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update title');
    }

    sendJsonResponse(['message' => 'Title updated successfully'], 200);

} catch (Exception $e) {
    error_log('Update title error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to update title'], 500);
}
