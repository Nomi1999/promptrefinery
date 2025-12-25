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
if (!isset($input['password'])) {
    sendJsonResponse(['error' => 'Password is required to delete account'], 400);
}

$password = $input['password'];

// Validate password not empty
if (empty($password)) {
    sendJsonResponse(['error' => 'Password cannot be empty'], 400);
}

try {
    // Check if user is authenticated
    $userId = getCurrentUserId();
    if (!$userId) {
        sendJsonResponse(['error' => 'Not authenticated'], 401);
    }
    
    // Get user's current password hash
    $stmt = $database->prepare("SELECT password_hash FROM users WHERE id = :user_id");
    $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    $user = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$user) {
        sendJsonResponse(['error' => 'User not found'], 404);
    }
    
    // Verify password before deletion
    if (!password_verify($password, $user['password_hash'])) {
        sendJsonResponse(['error' => 'Password is incorrect'], 401);
    }
    
    // Start transaction for atomic operations
    $database->exec('BEGIN TRANSACTION');
    
    try {
        // Delete all saved prompts for this user (CASCADE FK should handle this, but we'll do it explicitly to be safe)
        $deletePromptsStmt = $database->prepare("DELETE FROM saved_prompts WHERE user_id = :user_id");
        $deletePromptsStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
        $deletePromptsStmt->execute();
        
        // Delete user account
        $deleteUserStmt = $database->prepare("DELETE FROM users WHERE id = :user_id");
        $deleteUserStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
        $deleteUserStmt->execute();
        
        // Commit transaction
        $database->exec('COMMIT');
        
        // Destroy session
        session_destroy();
        session_start();
        session_unset();
        
        // Clear session cookies
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
        
        sendJsonResponse(['message' => 'Account deleted successfully'], 200);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $database->exec('ROLLBACK');
        throw $e;
    }
    
} catch (Exception $e) {
    error_log('Delete account error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Account deletion failed'], 500);
}
