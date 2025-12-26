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
if (!isset($input['original_prompt']) || !isset($input['enhanced_prompt'])) {
    sendJsonResponse(['error' => 'Original prompt and enhanced prompt are required'], 400);
}

$originalPrompt = sanitizeInput($input['original_prompt']);
$enhancedPrompt = sanitizeInput($input['enhanced_prompt']);
$notes = isset($input['notes']) ? sanitizeInput($input['notes']) : null;

// Validate prompt content
if (empty($originalPrompt) || empty($enhancedPrompt)) {
    sendJsonResponse(['error' => 'Prompt content cannot be empty'], 400);
}

// Validate prompt length (max 10,000 characters)
if (strlen($originalPrompt) > 10000 || strlen($enhancedPrompt) > 10000) {
    sendJsonResponse(['error' => 'Prompt content exceeds maximum length of 10,000 characters'], 400);
}

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }
    
    // Check if user has reached the 100 saved prompts limit
    $countStmt = $database->prepare("SELECT COUNT(*) as count FROM saved_prompts WHERE user_id = :user_id");
    $countStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $countResult = $countStmt->execute();
    $countData = $countResult->fetchArray(SQLITE3_ASSOC);
    
    if ($countData['count'] >= 100) {
        sendJsonResponse(['error' => 'Maximum 100 saved prompts reached. Please delete some prompts to save new ones.'], 409);
    }
    
    // Insert new saved prompt
    $insertStmt = $database->prepare("INSERT INTO saved_prompts (user_id, original_prompt, enhanced_prompt, notes) VALUES (:user_id, :original_prompt, :enhanced_prompt, :notes)");
    $insertStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $insertStmt->bindValue(':original_prompt', $originalPrompt, SQLITE3_TEXT);
    $insertStmt->bindValue(':enhanced_prompt', $enhancedPrompt, SQLITE3_TEXT);
    $insertStmt->bindValue(':notes', $notes, SQLITE3_TEXT);
    
    if ($insertStmt->execute()) {
        $promptId = $database->lastInsertRowid();

        // Try to generate title for the saved prompt (non-blocking)
        $generatedTitle = null;
        try {
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
                                'content' => $enhancedPrompt
                            ]
                        ],
                        'max_tokens' => 30,
                        'temperature' => 0.3
                    ])
                ]
            ]));

            if ($response !== false) {
                $data = json_decode($response, true);
                $title = trim($data['choices'][0]['message']['content'] ?? '');

                if (!empty($title)) {
                    // Clean up title
                    $title = preg_replace('/^[\'""]|[\'""]$/', '', $title);
                    $title = preg_replace('/^(?:Title:|The title is:?|Generated title:?)\s*/i', '', $title);
                    $title = trim($title);

                    // Limit to 100 characters
                    if (strlen($title) > 100) {
                        $title = substr($title, 0, 97) . '...';
                    }

                    // Update database with generated title
                    $updateStmt = $database->prepare("UPDATE saved_prompts SET title = :title WHERE id = :id AND user_id = :user_id");
                    $updateStmt->bindValue(':title', $title, SQLITE3_TEXT);
                    $updateStmt->bindValue(':id', $promptId, SQLITE3_INTEGER);
                    $updateStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
                    $updateStmt->execute();

                    $generatedTitle = $title;
                }
            }
        } catch (Exception $e) {
            // Log error but don't block save
            error_log('Title generation error: ' . $e->getMessage());
        }

        sendJsonResponse(['message' => 'Prompt saved successfully', 'id' => $promptId, 'title' => $generatedTitle], 201);
    } else {
        sendJsonResponse(['error' => 'Failed to save prompt'], 500);
    }
    
} catch (Exception $e) {
    error_log('Save prompt error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Save failed'], 500);
}
