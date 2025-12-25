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
if (!isset($input['current_password']) || !isset($input['new_password'])) {
    sendJsonResponse(['error' => 'Current password and new password are required'], 400);
}

$currentPassword = $input['current_password'];
$newPassword = $input['new_password'];

// Validate password not empty
if (empty($currentPassword) || empty($newPassword)) {
    sendJsonResponse(['error' => 'Password fields cannot be empty'], 400);
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
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        sendJsonResponse(['error' => 'Current password is incorrect'], 401);
    }
    
    // Check if new password is the same as current
    if (password_verify($newPassword, $user['password_hash'])) {
        sendJsonResponse(['error' => 'New password must be different from current password'], 400);
    }
    
    // Validate new password strength
    if (strlen($newPassword) < 8) {
        sendJsonResponse(['error' => 'New password must be at least 8 characters long'], 400);
    }
    
    if (!preg_match('/[A-Z]/', $newPassword)) {
        sendJsonResponse(['error' => 'New password must contain at least one uppercase letter'], 400);
    }
    
    if (!preg_match('/[a-z]/', $newPassword)) {
        sendJsonResponse(['error' => 'New password must contain at least one lowercase letter'], 400);
    }
    
    if (!preg_match('/[0-9]/', $newPassword)) {
        sendJsonResponse(['error' => 'New password must contain at least one number'], 400);
    }
    
    if (!preg_match('/[^A-Za-z0-9]/', $newPassword)) {
        sendJsonResponse(['error' => 'New password must contain at least one special character'], 400);
    }
    
    // Hash new password
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    if (!$newPasswordHash) {
        sendJsonResponse(['error' => 'Password hashing failed'], 500);
    }
    
    // Update password in database
    $updateStmt = $database->prepare("UPDATE users SET password_hash = :password_hash WHERE id = :user_id");
    $updateStmt->bindValue(':password_hash', $newPasswordHash, SQLITE3_TEXT);
    $updateStmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
    
    if ($updateStmt->execute()) {
        sendJsonResponse(['message' => 'Password changed successfully'], 200);
    } else {
        sendJsonResponse(['error' => 'Password change failed'], 500);
    }
    
} catch (Exception $e) {
    error_log('Change password error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Password change failed'], 500);
}
