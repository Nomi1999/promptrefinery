# Technical Stack: PromptRefinery

## Core Technologies

### Frontend
- **HTML5:** Semantic markup for structure.
- **CSS3:** Custom styling with CSS Variables (Custom Properties) for theming.
    - Flexbox & Grid for layout.
    - Media queries for responsiveness.
- **JavaScript:** Vanilla ES6+ for interactivity and API communication.
    - No framework (React/Vue/Angular) used to keep it lightweight.
    - `fetch` API for network requests.
    - `localStorage` for client-side persistence (theme, preferences).

### Backend
- **PHP:** Server-side logic (Version 7.4+ recommended).
    - Session management for authentication.
    - PDO/SQLite3 extension for database interaction.
    - JSON handling for API responses.

### Database
- **SQLite3:** Serverless, file-based database.
    - `users.db` stored in `data/` directory.
    - Tables: `users`, `saved_prompts`.

### AI Integration
- **UncloseAI API:**
    - **Endpoint:** `https://hermes.ai.unturf.com/v1/chat/completions`
    - **Model:** `adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic`
    - **Usage:** Prompt enhancement, feedback generation, title generation.

## Development Environment
- **Web Server:** Any PHP-capable server (Apache, Nginx, PHP built-in server).
- **Version Control:** Git.

## Technical Constraints & Considerations
- **Security:**
    - API keys for UncloseAI need to be protected. Current implementation might be exposing them in client-side JS (needs verification).
    - Input sanitization required on both frontend and backend to prevent XSS/SQL Injection.
    - `data/` directory must be writable by the web server user but protected from direct web access (via `.htaccess` or server config).
- **Performance:**
    - Minimal dependencies ensure fast load times.
    - Database is local, so latency is low for user data.
    - AI API calls depend on external service latency.
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge) supporting ES6 and CSS Variables.

## Code Structure Patterns
- **API Pattern:**
    - Endpoints return JSON.
    - Status codes indicate success/failure (200, 201, 400, 401, 500).
- **Frontend Pattern:**
    - Event delegation where appropriate.
    - Separation of concerns: specific JS files for specific pages (`script.js` for app, `landing.js` for home).
    - Shared CSS variables for consistent design system.