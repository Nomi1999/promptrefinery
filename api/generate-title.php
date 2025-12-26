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
if (!isset($input['prompt'])) {
    sendJsonResponse(['error' => 'Prompt is required'], 400);
}

$prompt = trim($input['prompt']);

// Validate prompt content
if (empty($prompt)) {
    sendJsonResponse(['error' => 'Prompt cannot be empty'], 400);
}

try {
    // Call UncloseAI Hermes API to generate title
    $systemPrompt = "Generate a short, descriptive title (5-10 words, max 100 characters) for this prompt. The title should capture the main topic or purpose. Return ONLY the title, no quotes, no markdown, no explanations.";

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
                        'content' => $prompt
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

    sendJsonResponse(['title' => $title], 200);

} catch (Exception $e) {
    error_log('Generate title error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to generate title'], 500);
}
