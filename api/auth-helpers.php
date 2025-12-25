<?php
// Security configuration for authentication endpoints
// This file should be included at the top of all API endpoint files

// Secure session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if HTTPS is available
ini_set('session.use_strict_mode', 1);
ini_set('session.use_cookies', 1);
ini_set('session.use_only_cookies', 1);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper function to return JSON responses
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

// Helper function to validate and sanitize input
function sanitizeInput($input) {
    if (is_string($input)) {
        return trim(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
    }
    return $input;
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Helper function to get current user ID
function getCurrentUserId() {
    return isAuthenticated() ? $_SESSION['user_id'] : null;
}
?>