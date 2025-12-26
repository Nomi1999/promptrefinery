<?php
require_once '../config/database.php';
require_once 'auth-helpers.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }

    // Fetch prompts without titles (limit to 10 per request for batch processing)
    $stmt = $database->prepare("SELECT id, enhanced_prompt FROM saved_prompts WHERE user_id = :user_id AND (title IS NULL OR title = '') LIMIT 10");
    $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();

    $promptsToMigrate = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $promptsToMigrate[] = $row;
    }

    if (empty($promptsToMigrate)) {
        sendJsonResponse(['migrated' => 0, 'failed' => 0, 'remaining' => 0], 200);
    }

    $migrated = 0;
    $failed = 0;
    $systemPrompt = "Generate a short, descriptive title (5-10 words, max 100 characters) for this prompt. The title should capture main topic or purpose. Return ONLY the title, no quotes, no markdown, no explanations.";

    foreach ($promptsToMigrate as $prompt) {
        try {
            // Generate title
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
                                'content' => $prompt['enhanced_prompt']
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

            // Clean up title
            $title = preg_replace('/^[\'""]|[\'""]$/', '', $title);
            $title = preg_replace('/^(?:Title:|The title is:?|Generated title:?)\s*/i', '', $title);
            $title = trim($title);

            // Limit to 100 characters
            if (strlen($title) > 100) {
                $title = substr($title, 0, 97) . '...';
            }

            // Update database
            $updateStmt = $database->prepare("UPDATE saved_prompts SET title = :title WHERE id = :id AND user_id = :user_id");
            $updateStmt->bindValue(':title', $title, SQLITE3_TEXT);
            $updateStmt->bindValue(':id', $prompt['id'], SQLITE3_INTEGER);
            $updateStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);

            if ($updateStmt->execute()) {
                $migrated++;
            } else {
                $failed++;
            }

            // Small delay between requests for rate limiting
            usleep(500000); // 500ms

        } catch (Exception $e) {
            error_log('Migration error for prompt ID ' . $prompt['id'] . ': ' . $e->getMessage());
            $failed++;
        }
    }

    // Check how many remain
    $countStmt = $database->prepare("SELECT COUNT(*) as count FROM saved_prompts WHERE user_id = :user_id AND (title IS NULL OR title = '')");
    $countStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $countResult = $countStmt->execute();
    $countData = $countResult->fetchArray(SQLITE3_ASSOC);
    $remaining = $countData['count'];

    sendJsonResponse([
        'migrated' => $migrated,
        'failed' => $failed,
        'remaining' => $remaining
    ], 200);

} catch (Exception $e) {
    error_log('Migration error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Migration failed'], 500);
}
