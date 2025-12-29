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
if (!isset($input['username']) || !isset($input['password'])) {
    sendJsonResponse(['error' => 'Missing required fields'], 400);
}

$username = sanitizeInput($input['username']);
$password = $input['password'];

// Basic input validation
if (empty($username) || empty($password)) {
    sendJsonResponse(['error' => 'Username and password are required'], 400);
}

// Implement basic rate limiting (track failed attempts in session)
$failedAttempts = isset($_SESSION['login_attempts']) ? $_SESSION['login_attempts'] : 0;
$lastAttempt = isset($_SESSION['last_login_attempt']) ? $_SESSION['last_login_attempt'] : 0;
$currentTime = time();

// Reset attempts if more than 15 minutes have passed
if ($currentTime - $lastAttempt > 900) { // 15 minutes = 900 seconds
    $failedAttempts = 0;
}

// Check if too many failed attempts
if ($failedAttempts >= 5) {
    sendJsonResponse(['error' => 'Too many failed login attempts. Please try again later.'], 429);
}

try {
    // Find user by username or email
    $stmt = $database->prepare("SELECT id, username, password_hash FROM users WHERE LOWER(username) = LOWER(:identifier) OR LOWER(email) = LOWER(:identifier)");
    $stmt->bindValue(':identifier', $username, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    $user = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Increment failed attempts
        $_SESSION['login_attempts'] = $failedAttempts + 1;
        $_SESSION['last_login_attempt'] = $currentTime;
        sendJsonResponse(['error' => 'Invalid credentials'], 401);
    }
    
    // Successful login - clear failed attempts
    unset($_SESSION['login_attempts']);
    unset($_SESSION['last_login_attempt']);
    
    // Set session data
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    
    sendJsonResponse([
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username']
        ]
    ], 200);
    
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Login failed'], 500);
}
?>