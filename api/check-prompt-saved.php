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
if (!isset($input['enhanced_prompt'])) {
    sendJsonResponse(['error' => 'Enhanced prompt is required'], 400);
}

$enhancedPrompt = sanitizeInput($input['enhanced_prompt']);

// Validate prompt content
if (empty($enhancedPrompt)) {
    sendJsonResponse(['error' => 'Enhanced prompt cannot be empty'], 400);
}

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }
    
    // Check if this enhanced prompt is already saved for the current user
    // Using a hash comparison to efficiently find exact matches
    $promptHash = md5($enhancedPrompt);
    
    $stmt = $database->prepare("SELECT id FROM saved_prompts WHERE user_id = :user_id AND enhanced_prompt = :enhanced_prompt LIMIT 1");
    $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $stmt->bindValue(':enhanced_prompt', $enhancedPrompt, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    $promptData = $result->fetchArray(SQLITE3_ASSOC);
    
    if ($promptData) {
        sendJsonResponse(['saved' => true, 'prompt_id' => $promptData['id']], 200);
    } else {
        sendJsonResponse(['saved' => false], 200);
    }
    
} catch (Exception $e) {
    error_log('Check prompt saved error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Check failed'], 500);
}
