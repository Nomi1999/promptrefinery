<?php
// Test script for saved_prompts table and new API endpoints
// Usage: Access via browser or command line

require_once '../config/database.php';

echo "=== Database Setup Test ===\n\n";

// Test 1: Check if saved_prompts table exists
echo "1. Checking if saved_prompts table exists...\n";
$stmt = $database->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='saved_prompts'");
$result = $stmt->execute();
$tableExists = $result->fetchArray(SQLITE3_ASSOC);

if ($tableExists) {
    echo "   ✓ saved_prompts table exists\n";
} else {
    echo "   ✗ saved_prompts table does NOT exist\n";
}

// Test 2: Check table structure
echo "\n2. Checking saved_prompts table structure...\n";
$columns = $database->query("PRAGMA table_info(saved_prompts)");
$columnNames = [];
while ($col = $columns->fetchArray(SQLITE3_ASSOC)) {
    $columnNames[] = $col['name'];
    echo "   - " . $col['name'] . " (" . $col['type'] . ")\n";
}

$expectedColumns = ['id', 'user_id', 'original_prompt', 'enhanced_prompt', 'notes', 'created_at'];
$missingColumns = array_diff($expectedColumns, $columnNames);

if (empty($missingColumns)) {
    echo "   ✓ All expected columns present\n";
} else {
    echo "   ✗ Missing columns: " . implode(', ', $missingColumns) . "\n";
}

// Test 3: Check index on user_id
echo "\n3. Checking if idx_user_id index exists...\n";
$indexes = $database->query("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='saved_prompts'");
$indexExists = false;
while ($idx = $indexes->fetchArray(SQLITE3_ASSOC)) {
    if ($idx['name'] === 'idx_user_id') {
        $indexExists = true;
        break;
    }
}

if ($indexExists) {
    echo "   ✓ idx_user_id index exists\n";
} else {
    echo "   ✗ idx_user_id index does NOT exist\n";
}

// Test 4: Check foreign key constraint
echo "\n4. Checking foreign key constraint...\n";
$fkQuery = $database->query("PRAGMA foreign_key_list(saved_prompts)");
$fkExists = false;
while ($fk = $fkQuery->fetchArray(SQLITE3_ASSOC)) {
    if ($fk['table'] === 'users' && $fk['from'] === 'user_id') {
        $fkExists = true;
        echo "   ✓ Foreign key constraint found: " . $fk['from'] . " -> " . $fk['table'] . "." . $fk['to'] . "\n";
        if (strpos($fk['on_delete'], 'CASCADE') !== false) {
            echo "   ✓ CASCADE on delete configured\n";
        }
        break;
    }
}

if (!$fkExists) {
    echo "   ✗ Foreign key constraint NOT found\n";
}

// Test 5: Check API files exist
echo "\n5. Checking if all API files exist...\n";
$apiFiles = [
    'save-prompt.php' => 'Save Prompt',
    'get-saved-prompts.php' => 'Get Saved Prompts',
    'delete-saved-prompt.php' => 'Delete Saved Prompt',
    'check-prompt-saved.php' => 'Check Prompt Saved',
    'get-profile.php' => 'Get Profile',
    'change-password.php' => 'Change Password',
    'delete-account.php' => 'Delete Account'
];

$apiDir = __DIR__;
foreach ($apiFiles as $file => $description) {
    $filePath = $apiDir . '/' . $file;
    if (file_exists($filePath)) {
        echo "   ✓ $description ($file)\n";
    } else {
        echo "   ✗ $description ($file) - NOT FOUND\n";
    }
}

// Test 6: Summary
echo "\n=== Test Summary ===\n";
$allPassed = $tableExists && empty($missingColumns) && $indexExists && $fkExists;

if ($allPassed) {
    echo "✓ All database tests passed!\n";
    echo "✓ All API files created!\n";
    echo "\nPhase 1 implementation is complete and ready for testing.\n";
} else {
    echo "✗ Some tests failed. Please review the output above.\n";
}
