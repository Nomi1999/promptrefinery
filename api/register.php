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
if (!isset($input['username']) || !isset($input['email']) || !isset($input['password'])) {
    sendJsonResponse(['error' => 'Missing required fields'], 400);
}

$username = sanitizeInput($input['username']);
$email = sanitizeInput($input['email']);
$password = $input['password']; // Don't sanitize passwords (they can contain special chars)

// Validate username
if (strlen($username) < 3 || strlen($username) > 20) {
    sendJsonResponse(['error' => 'Username must be between 3 and 20 characters'], 400);
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    sendJsonResponse(['error' => 'Username can only contain letters, numbers, and underscores'], 400);
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(['error' => 'Invalid email format'], 400);
}

// Validate password strength
if (strlen($password) < 8) {
    sendJsonResponse(['error' => 'Password must be at least 8 characters long'], 400);
}

if (!preg_match('/[A-Z]/', $password)) {
    sendJsonResponse(['error' => 'Password must contain at least one uppercase letter'], 400);
}

if (!preg_match('/[a-z]/', $password)) {
    sendJsonResponse(['error' => 'Password must contain at least one lowercase letter'], 400);
}

if (!preg_match('/[0-9]/', $password)) {
    sendJsonResponse(['error' => 'Password must contain at least one number'], 400);
}

if (!preg_match('/[^A-Za-z0-9]/', $password)) {
    sendJsonResponse(['error' => 'Password must contain at least one special character'], 400);
}

try {
    // Check if username or email already exists
    $checkStmt = $database->prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(:username) OR LOWER(email) = LOWER(:email)");
    $checkStmt->bindValue(':username', $username, SQLITE3_TEXT);
    $checkStmt->bindValue(':email', $email, SQLITE3_TEXT);
    $checkResult = $checkStmt->execute();
    
    if ($checkResult->fetchArray(SQLITE3_ASSOC)) {
        sendJsonResponse(['error' => 'Username or email already exists'], 409);
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    if (!$passwordHash) {
        sendJsonResponse(['error' => 'Password hashing failed'], 500);
    }
    
    // Insert new user
    $insertStmt = $database->prepare("INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)");
    $insertStmt->bindValue(':username', $username, SQLITE3_TEXT);
    $insertStmt->bindValue(':email', $email, SQLITE3_TEXT);
    $insertStmt->bindValue(':password_hash', $passwordHash, SQLITE3_TEXT);
    
    if ($insertStmt->execute()) {
        sendJsonResponse(['message' => 'User registered successfully'], 201);
    } else {
        sendJsonResponse(['error' => 'Registration failed'], 500);
    }
    
} catch (Exception $e) {
    error_log('Registration error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Registration failed'], 500);
}
?>