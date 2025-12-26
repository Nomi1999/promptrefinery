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

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }

    // Fetch the prompt and verify ownership
    $stmt = $database->prepare("SELECT enhanced_prompt FROM saved_prompts WHERE id = :id AND user_id = :user_id");
    $stmt->bindValue(':id', $promptId, SQLITE3_INTEGER);
    $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $promptData = $result->fetchArray(SQLITE3_ASSOC);

    if (!$promptData) {
        sendJsonResponse(['error' => 'Prompt not found'], 404);
    }

    // Generate new title
    $systemPrompt = "Generate a short, descriptive title (5-10 words, max 100 characters) for this prompt. The title should capture main topic or purpose. Return ONLY the title, no quotes, no markdown, no explanations.";

    $response = @file_get_contents('https://hermes.ai.unturf.com/v1/chat/completions', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nAuthorization: Bearer dummy-api-key\r\n",
            'timeout' => 10,
            'content' => json_encode([
                'model' => 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt
                    ],
                    [
                        'role' => 'user',
                        'content' => $promptData['enhanced_prompt']
                    ]
                ],
                'max_tokens' => 30,
                'temperature' => 0.3
            ])
        ]
    ]));

    if ($response === false) {
        throw new Exception('Failed to connect to AI service');
    }

    $data = json_decode($response, true);
    $title = trim($data['choices'][0]['message']['content'] ?? '');

    if (empty($title)) {
        throw new Exception('AI returned empty title');
    }

    // Clean the title
    $title = preg_replace('/^[\'""]|[\'""]$/', '', $title);
    $title = preg_replace('/^(?:Title:|The title is:?|Generated title:?)\s*/i', '', $title);
    $title = trim($title);

    // Limit to 100 characters
    if (strlen($title) > 100) {
        $title = substr($title, 0, 97) . '...';
    }

    // Update database with new title
    $updateStmt = $database->prepare("UPDATE saved_prompts SET title = :title WHERE id = :id AND user_id = :user_id");
    $updateStmt->bindValue(':title', $title, SQLITE3_TEXT);
    $updateStmt->bindValue(':id', $promptId, SQLITE3_INTEGER);
    $updateStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);

    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update title in database');
    }

    sendJsonResponse(['title' => $title], 200);

} catch (Exception $e) {
    error_log('Regenerate title error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to regenerate title'], 500);
}
