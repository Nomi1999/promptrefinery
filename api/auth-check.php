<?php
require_once 'auth-helpers.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

if (isAuthenticated()) {
    sendJsonResponse([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username']
        ]
    ], 200);
} else {
    sendJsonResponse(['authenticated' => false], 401);
}
?>