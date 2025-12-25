<?php
// Database connection and schema setup
// This file handles SQLite database creation and table initialization

// Ensure the data directory exists with proper permissions
if (!file_exists(__DIR__ . '/../data')) {
    if (!mkdir(__DIR__ . '/../data', 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create data directory']);
        exit;
    }
}

try {
    // Create SQLite database connection
    $database = new SQLite3(__DIR__ . '/../data/users.db');
    
    // Set busy timeout for better concurrency handling
    $database->busyTimeout(5000);
    
    // Create users table if it doesn't exist
    $createTableSQL = "CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$database->exec($createTableSQL)) {
        throw new Exception('Failed to create users table: ' . $database->lastErrorMsg());
    }
    
    // Create index on username and email for faster lookups
    $database->exec("CREATE INDEX IF NOT EXISTS idx_username ON users(username)");
    $database->exec("CREATE INDEX IF NOT EXISTS idx_email ON users(email)");
    
    // Create saved_prompts table if it doesn't exist
    $createSavedPromptsSQL = "CREATE TABLE IF NOT EXISTS saved_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        original_prompt TEXT NOT NULL,
        enhanced_prompt TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    
    if (!$database->exec($createSavedPromptsSQL)) {
        throw new Exception('Failed to create saved_prompts table: ' . $database->lastErrorMsg());
    }
    
    // Create index on user_id for faster queries
    $database->exec("CREATE INDEX IF NOT EXISTS idx_user_id ON saved_prompts(user_id)");
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database initialization failed: ' . $e->getMessage()]);
    exit;
}
?>