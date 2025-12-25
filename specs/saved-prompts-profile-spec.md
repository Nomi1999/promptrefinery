# Saved Prompts & Profile Management Implementation Specification

## Overview
This document outlines the implementation plan for adding two new features for logged-in users:
1. **Save Enhanced Prompts** - Allow users to save enhanced prompts they like (max 100 per user)
2. **User Profile Management** - Allow users to change password and delete their account

## Architecture
- **Frontend**: Existing HTML/CSS/JavaScript structure with new modal components
- **Backend**: PHP scripts handling new API endpoints
- **Database**: SQLite with additional `saved_prompts` table
- **Sessions**: PHP native session management (existing)
- **Hosting**: InfinityFree shared hosting (PHP-only environment)

## File Structure Changes

### New API Endpoints
```
/api/
├── save-prompt.php
├── get-saved-prompts.php
├── delete-saved-prompt.php
├── check-prompt-saved.php
├── get-profile.php
├── change-password.php
└── delete-account.php
```

### Modified Files
- `config/database.php` - Add `saved_prompts` table
- `index.html` - Add UI elements and modals
- `css/styles.css` - Add new styles
- `js/script.js` - Add new functions and event listeners

## Database Schema

### New Table: saved_prompts
```sql
CREATE TABLE IF NOT EXISTS saved_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    original_prompt TEXT NOT NULL,
    enhanced_prompt TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON saved_prompts(user_id);
```

### Constraints
- Maximum 100 saved prompts per user
- Maximum 10,000 characters per prompt field
- Cascading delete (when user is deleted, all saved prompts are automatically deleted)

## Security Specifications

### Authentication Requirements
- All new API endpoints require authenticated sessions
- User can only access/modify their own data
- Password confirmation required for account deletion

### Input Validation
- Server-side validation for all inputs
- Client-side validation for user experience
- Sanitize all user inputs before database operations
- Implement proper error messages without exposing system details

### Password Security
- Current password verification required for password changes
- New password must meet existing strength requirements (8+ chars, mixed case, numbers, special chars)
- Use PHP's built-in `password_hash()` and `password_verify()` functions

## API Endpoints

### POST /api/save-prompt.php
**Request Body (JSON):**
```json
{
    "original_prompt": "string",
    "enhanced_prompt": "string",
    "notes": "string (optional)"
}
```

**Validation Rules:**
- User must be authenticated
- User must have < 100 saved prompts
- `original_prompt` and `enhanced_prompt` are required
- Each prompt field max 10,000 characters

**Responses:**
- 201 Created: `{"message": "Prompt saved successfully", "id": 123}`
- 400 Bad Request: `{"error": "Invalid input"}`
- 401 Unauthorized: `{"error": "Not authenticated"}`
- 409 Conflict: `{"error": "Maximum 100 saved prompts reached"}`
- 500 Internal Error: `{"error": "Save failed"}`

### GET /api/get-saved-prompts.php
**Query Parameters:**
- None (returns all saved prompts for current user)

**Responses:**
- 200 OK: 
```json
{
    "prompts": [
        {
            "id": 123,
            "original_prompt": "...",
            "enhanced_prompt": "...",
            "notes": "...",
            "created_at": "2024-01-15 10:30:00"
        }
    ],
    "count": 5,
    "limit": 100
}
```
- 401 Unauthorized: `{"error": "Not authenticated"}`
- 500 Internal Error: `{"error": "Load failed"}`

### POST /api/delete-saved-prompt.php
**Request Body (JSON):**
```json
{
    "prompt_id": 123
}
```

**Responses:**
- 200 OK: `{"message": "Prompt deleted successfully"}`
- 400 Bad Request: `{"error": "Invalid prompt ID"}`
- 401 Unauthorized: `{"error": "Not authenticated or not owner"}`
- 500 Internal Error: `{"error": "Delete failed"}`

### POST /api/check-prompt-saved.php
**Request Body (JSON):**
```json
{
    "enhanced_prompt": "string"
}
```

**Responses:**
- 200 OK: `{"saved": true, "prompt_id": 123}` or `{"saved": false}`
- 400 Bad Request: `{"error": "Enhanced prompt required"}`
- 401 Unauthorized: `{"error": "Not authenticated"}`
- 500 Internal Error: `{"error": "Check failed"}`

### GET /api/get-profile.php
**Responses:**
- 200 OK:
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-01 00:00:00",
    "saved_prompts_count": 5
}
```
- 401 Unauthorized: `{"error": "Not authenticated"}`
- 500 Internal Error: `{"error": "Profile load failed"}`

### POST /api/change-password.php
**Request Body (JSON):**
```json
{
    "current_password": "string",
    "new_password": "string"
}
```

**Validation Rules:**
- Current password must be correct
- New password must be different from current password
- New password must meet strength requirements

**Responses:**
- 200 OK: `{"message": "Password changed successfully"}`
- 400 Bad Request: `{"error": "Invalid input"}` or `{"error": "New password too weak"}`
- 401 Unauthorized: `{"error": "Current password incorrect"}`
- 500 Internal Error: `{"error": "Password change failed"}`

### POST /api/delete-account.php
**Request Body (JSON):**
```json
{
    "password": "string"
}
```

**Responses:**
- 200 OK: `{"message": "Account deleted successfully"}`
- 400 Bad Request: `{"error": "Password required"}`
- 401 Unauthorized: `{"error": "Password incorrect"}`
- 500 Internal Error: `{"error": "Account deletion failed"}`

## Frontend Implementation Requirements

### UI Components Needed

#### Save Prompt Button
- Add bookmark icon button to output panel header
- Visual states: outline (not saved) vs filled (saved)
- Disabled when no enhanced prompt exists
- Click handler calls save API

#### User Menu Enhancement
- Replace simple username display with profile button
- Profile button includes user icon + username
- Click opens profile modal

#### Sidebar Navigation
- Add "My Account" section with:
  - "My Saved Prompts" link
  - "Profile Settings" link

#### Saved Prompts Modal
- Title with count badge (e.g., "5 / 100 prompts saved")
- Empty state message when no prompts saved
- List of saved prompts with:
  - Enhanced prompt content (truncated to 2 lines)
  - Optional notes display
  - Timestamp ("just now", "2 hours ago", etc.)
  - Action buttons: "Use" and "Delete"
- Responsive design for mobile

#### Profile Modal
- Read-only account information section:
  - Username (disabled input)
  - Email (disabled input)  
  - Member since date
  - Saved prompts count
- Change password form:
  - Current password field
  - New password field with requirements note
  - Submit button
- Danger zone section:
  - Delete account button
  - Warning text about permanence
- Clean, organized layout

#### Delete Account Confirmation Modal
- Warning title in red
- Confirmation text explaining permanence
- Password input for final confirmation
- "Yes, Delete My Account" button (red background)
- "Cancel" button

### JavaScript Functionality

#### Saved Prompts Functions
- `savePrompt()` - Save current enhanced prompt
- `loadSavedPrompts()` - Fetch and display saved prompts
- `deleteSavedPrompt(promptId)` - Delete specific prompt with confirmation
- `useSavedPrompt(promptData)` - Load saved prompt into enhancer inputs
- `updateSaveButtonState(isSaved)` - Update visual state of save button
- `checkIfPromptSaved()` - Check if current enhanced prompt is already saved

#### Profile Management Functions
- `loadProfile()` - Fetch and display user profile data
- `handlePasswordChange()` - Submit password change form
- `handleDeleteAccount()` - Handle account deletion with confirmation
- `openProfileModal()` - Open profile modal and load data
- `closeProfileModal()` - Close and clean up profile modal

#### Utility Functions
- `formatDate(dateString)` - Format dates as relative time
- `escapeHtml(text)` - Escape HTML for safe rendering
- `openModal(modalElement)` - Generic modal opening function
- `closeModal(modalElement)` - Generic modal closing function

### State Management
- Check authentication status on page load (existing functionality)
- Enable/disable save button based on enhanced prompt availability
- Update save button state after enhancement based on saved status
- Handle session expiration gracefully during API calls
- Redirect to home page after account deletion

## InfinityFree Hosting Considerations

### Storage Limits
- Text-based data storage is efficient for prompts
- 100 prompts limit helps manage storage usage
- Each prompt limited to 10,000 characters to prevent abuse

### Performance Optimization
- Use prepared statements for all database queries
- Implement proper indexing on user_id column
- Minimize database calls per request
- Cache frequently accessed data when appropriate

### Resource Usage
- Optimize for InfinityFree's memory and CPU limits
- Implement efficient error logging without excessive disk writes
- Minimize file system operations

## Error Handling Strategy

### Common Error Scenarios
- Database connection failures
- Authentication/session expiration during API calls
- Input validation failures
- Storage limit exceeded (100 prompts)
- Password verification failures

### Error Response Format
All API endpoints return consistent JSON error format:
```json
{
    "error": "descriptive error message",
    "code": "optional_error_code"
}
```

### User Experience
- Display helpful error messages without technical details
- Provide clear guidance for resolving common issues
- Maintain form data on validation errors when possible
- Implement loading states for async operations

## Testing Requirements

### Backend Testing
- Verify database schema creation and constraints
- Test all validation rules and edge cases
- Validate password hashing and verification
- Test session security and ownership checks
- Verify cascading delete functionality

### Frontend Testing
- Test save prompt flow end-to-end
- Verify profile management functionality
- Test account deletion process
- Ensure error handling and user feedback
- Test mobile responsiveness of new components
- Ensure existing functionality remains intact

### Security Testing
- Verify user can only access their own data
- Test for common vulnerabilities (XSS, SQL injection)
- Validate session security settings
- Verify password strength requirements

## Implementation Phases

### Phase 1: Database + Backend APIs
- Update `config/database.php` - Add `saved_prompts` table
- Create all 7 new API endpoint files
- Test backend functionality independently

### Phase 2: Frontend UI Components
- Add save button to output panel in `index.html`
- Add profile button and user menu update in `index.html`
- Add sidebar links for saved prompts and profile
- Add all modals to `index.html`

### Phase 3: Styling
- Add new CSS styles to `styles.css`
- Ensure responsive design for all new components
- Test dark/light theme compatibility

### Phase 4: JavaScript Integration
- Add all new functions to `js/script.js`
- Add event listeners and integrate with existing code
- Test complete user flows

### Phase 5: Testing and Validation
- Test all features end-to-end
- Verify error handling and edge cases
- Ensure compatibility with existing authentication system
- Validate performance on InfinityFree hosting