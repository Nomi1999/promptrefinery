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
if (!isset($input['prompt_content'])) {
    sendJsonResponse(['error' => 'Prompt content is required'], 400);
}

$promptContent = sanitizeInput($input['prompt_content']);
$title = isset($input['title']) ? sanitizeInput($input['title']) : null;
$notes = isset($input['notes']) ? sanitizeInput($input['notes']) : null;

// Validate prompt content
if (empty(trim($promptContent))) {
    sendJsonResponse(['error' => 'Prompt content cannot be empty'], 400);
}

// Validate prompt length (max 10,000 characters)
if (strlen($promptContent) > 10000) {
    sendJsonResponse(['error' => 'Prompt content exceeds maximum length of 10,000 characters'], 400);
}

// Validate title length (max 100 characters)
if ($title && strlen($title) > 100) {
    sendJsonResponse(['error' => 'Title exceeds maximum length of 100 characters'], 400);
}

// Validate notes length (max 500 characters)
if ($notes && strlen($notes) > 500) {
    sendJsonResponse(['error' => 'Notes exceed maximum length of 500 characters'], 400);
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
    
    // For custom prompts, store the content as both original and enhanced prompt
    $originalPrompt = $promptContent;
    $enhancedPrompt = $promptContent;
    
    // Insert new saved prompt
    $insertStmt = $database->prepare("INSERT INTO saved_prompts (user_id, original_prompt, enhanced_prompt, notes, title) VALUES (:user_id, :original_prompt, :enhanced_prompt, :notes, :title)");
    $insertStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $insertStmt->bindValue(':original_prompt', $originalPrompt, SQLITE3_TEXT);
    $insertStmt->bindValue(':enhanced_prompt', $enhancedPrompt, SQLITE3_TEXT);
    $insertStmt->bindValue(':notes', $notes, SQLITE3_TEXT);
    $insertStmt->bindValue(':title', $title, SQLITE3_TEXT);
    
    if ($insertStmt->execute()) {
        $promptId = $database->lastInsertRowid();

        // If no title was provided, try to generate one with AI
        if (empty($title)) {
            try {
                $systemPrompt = "Generate a short, descriptive title (5-10 words, max 100 characters) for this custom prompt. The title should capture the main topic or purpose. Return ONLY the title, no quotes, no markdown, no explanations.";

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
                                    'content' => $promptContent
                                ]
                            ],
                            'max_tokens' => 30,
                            'temperature' => 0.3
                        ])
                    ]
                ]));

                if ($response !== false) {
                    $data = json_decode($response, true);
                    $generatedTitle = trim($data['choices'][0]['message']['content'] ?? '');

                    if (!empty($generatedTitle)) {
                        // Clean up title
                        $generatedTitle = preg_replace('/^[\'""]|[\'""]$/', '', $generatedTitle);
                        $generatedTitle = preg_replace('/^(?:Title:|The title is:?|Generated title:?)\s*/i', '', $generatedTitle);
                        $generatedTitle = trim($generatedTitle);

                        // Limit to 100 characters
                        if (strlen($generatedTitle) > 100) {
                            $generatedTitle = substr($generatedTitle, 0, 97) . '...';
                        }

                        // Update database with generated title
                        $updateStmt = $database->prepare("UPDATE saved_prompts SET title = :title WHERE id = :id AND user_id = :user_id");
                        $updateStmt->bindValue(':title', $generatedTitle, SQLITE3_TEXT);
                        $updateStmt->bindValue(':id', $promptId, SQLITE3_INTEGER);
                        $updateStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
                        $updateStmt->execute();

                        $title = $generatedTitle;
                    }
                }
            } catch (Exception $e) {
                // Log error but don't block save
                error_log('Title generation error: ' . $e->getMessage());
            }
        }

        sendJsonResponse([
            'message' => 'Custom prompt saved successfully', 
            'id' => $promptId, 
            'title' => $title,
            'prompt_type' => 'custom'
        ], 201);
    } else {
        sendJsonResponse(['error' => 'Failed to save custom prompt'], 500);
    }
    
} catch (Exception $e) {
    error_log('Save custom prompt error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Save failed'], 500);
}