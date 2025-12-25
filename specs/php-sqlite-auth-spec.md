# PHP + SQLite Authentication Implementation Specification

## Overview
This document outlines the complete implementation plan for adding secure user authentication to the PromptRefinery web application using PHP and SQLite, designed specifically for deployment on InfinityFree hosting.

## Architecture
- **Frontend**: Existing HTML/CSS/JavaScript structure remains unchanged
- **Backend**: PHP scripts handling authentication endpoints
- **Database**: SQLite file stored in protected directory
- **Sessions**: PHP native session management
- **Hosting**: InfinityFree shared hosting (PHP-only environment)

## File Structure
```
/htdocs/
├── index.html
├── prompt-library.html
├── css/
├── js/
├── assets/
├── api/
│   ├── register.php
│   ├── login.php  
│   ├── logout.php
│   └── auth-check.php
├── config/
│   └── database.php
├── data/
│   ├── users.db (created automatically)
│   └── .htaccess (blocks web access)
└── .htaccess (main site rules)
```

## Database Schema

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Requirements
- Username: 3-20 characters, alphanumeric with underscores allowed
- Email: Valid email format, unique
- Password: Minimum 8 characters with mixed case, numbers, and special characters
- All fields are required except created_at (auto-populated)

## Security Specifications

### Database Security
- SQLite database file stored in `/data/` directory
- `.htaccess` file in `/data/` blocks direct web access to database file
- File permissions set to 644 for database file
- Prepared statements used for all database queries to prevent SQL injection

### Session Security
- PHP session configuration:
  ```php
  ini_set('session.cookie_httponly', 1);
  ini_set('session.cookie_secure', 0); // Set to 1 if HTTPS available
  ini_set('session.use_strict_mode', 1);
  ```
- Session files managed by PHP's default file-based storage
- Sessions automatically expire based on PHP configuration

### Password Security
- Use PHP's built-in `password_hash()` function with `PASSWORD_DEFAULT`
- Current algorithm: bcrypt (cost factor automatically managed by PHP)
- Use `password_verify()` for credential validation
- Never store plain text passwords

### Input Validation
- Server-side validation for all inputs
- Client-side validation for user experience
- Sanitize all user inputs before database operations
- Implement proper error messages without exposing system details

## API Endpoints

### POST /api/register.php
**Request Body (JSON):**
```json
{
    "username": "string",
    "email": "string", 
    "password": "string"
}
```

**Validation Rules:**
- Username: 3-20 chars, alphanumeric + underscore only
- Email: Valid email format
- Password: 8+ chars, must contain uppercase, lowercase, number, special char

**Responses:**
- 201 Created: `{"message": "User registered successfully"}`
- 400 Bad Request: `{"error": "Invalid input"}`
- 409 Conflict: `{"error": "Username or email already exists"}`
- 500 Internal Error: `{"error": "Registration failed"}`

### POST /api/login.php
**Request Body (JSON):**
```json
{
    "username": "string",
    "password": "string"
}
```

**Responses:**
- 200 OK: `{"message": "Login successful", "user": {"id": 1, "username": "user"}}`
- 401 Unauthorized: `{"error": "Invalid credentials"}`
- 429 Too Many Requests: `{"error": "Too many failed attempts"}`
- 500 Internal Error: `{"error": "Login failed"}`

### POST /api/logout.php
**Responses:**
- 200 OK: `{"message": "Logout successful"}`

### GET /api/auth-check.php
**Responses:**
- 200 OK: `{"authenticated": true, "user": {"id": 1, "username": "user"}}`
- 401 Unauthorized: `{"authenticated": false}`

## Frontend Integration Requirements

### JavaScript Updates
- Add AJAX functions for authentication endpoints
- Implement authentication state management
- Update UI based on auth state (show/hide login buttons, etc.)
- Handle error responses gracefully with user-friendly messages
- Maintain existing prompt enhancement functionality

### UI Components Needed
- Login modal/form
- Registration modal/form  
- User profile dropdown (logout button)
- Authenticated state indicators
- Error/success notification system

### State Management
- Check authentication status on page load
- Redirect unauthenticated users from protected features
- Maintain session across page navigation
- Handle session expiration gracefully

## InfinityFree Hosting Considerations

### Constraints
- PHP version: 7.4+ (supports modern password hashing)
- SQLite3 extension: Enabled by default
- File system: Write access to `/htdocs/` and subdirectories
- No HTTPS on free tier (HTTP only)
- Resource limits: Optimize for shared hosting environment

### Deployment Requirements
- Upload all files to `/htdocs/` directory
- Ensure `/data/` directory has write permissions (755)
- Verify `.htaccess` files are properly configured
- Test database file creation and write access
- Monitor resource usage and optimize as needed

## Error Handling Strategy

### Common Error Scenarios
- Database connection failures
- Duplicate username/email during registration
- Invalid credentials during login
- Session expiration during use
- Input validation failures
- Rate limiting triggers

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

## Performance Optimization

### Database Queries
- Use prepared statements for all queries
- Implement proper indexing on username and email columns
- Minimize database calls per request
- Cache frequently accessed data when appropriate

### Session Management
- Use PHP's optimized session handling
- Implement session cleanup for expired sessions
- Monitor session file growth on shared hosting

### Resource Usage
- Optimize for InfinityFree's memory and CPU limits
- Implement efficient error logging without excessive disk writes
- Minimize file system operations

## Testing Requirements

### Backend Testing
- Verify database schema creation
- Test all validation rules and edge cases
- Validate password hashing and verification
- Test session creation and destruction
- Verify security protections (SQL injection prevention, etc.)

### Frontend Testing
- Test authentication flow end-to-end
- Verify error handling and user feedback
- Test mobile responsiveness of auth components
- Ensure existing functionality remains intact
- Test cross-browser compatibility

### Security Testing
- Verify database file cannot be accessed via web URL
- Test for common vulnerabilities (XSS, CSRF, SQL injection)
- Validate session security settings
- Verify password strength requirements

## Backup and Recovery

### Database Backup Strategy
- Manual backup process documented
- Regular backup schedule recommendation
- Export/import procedures for user data migration

### Recovery Procedures
- Steps to restore from backup
- Database corruption handling
- User account recovery process

## Future Enhancements

### Scalability Considerations
- Migration path to MySQL if user base grows significantly
- Caching layer implementation for high-traffic scenarios
- Load balancing considerations for multiple servers

### Feature Extensions
- Password reset functionality
- Email verification system
- User profile management
- API key generation for programmatic access
- Two-factor authentication support

## Implementation Phases

### Phase 1: Backend Infrastructure
- Create database schema and connection logic
- Implement security configurations
- Set up file structure with protections

### Phase 2: Core Authentication Endpoints  
- Implement registration, login, logout, and auth-check endpoints
- Add comprehensive validation and error handling
- Test all backend functionality

### Phase 3: Frontend Integration
- Update JavaScript for AJAX calls to PHP endpoints
- Implement authentication state management
- Ensure seamless integration with existing features

### Phase 4: User Interface Components
- Add login/registration forms to UI
- Implement protected routes and auth indicators
- Ensure mobile-responsive design

