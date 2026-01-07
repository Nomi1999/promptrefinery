# System Architecture: PromptRefinery

## Overview
PromptRefinery follows a classic Multi-Page Application (MPA) architecture with a lightweight Single-Page Application (SPA) feel for the main enhancer interface. It separates concerns between a static frontend (HTML/CSS/JS) and a dynamic API-driven backend (PHP/SQLite).

## System Components

### 1. Frontend Layer
- **Technology:** Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Structure:**
    - **Pages:** `index.html` (Landing), `app.html` (Enhancer), `saved-prompts.html`, `prompt-library.html`.
    - **Styling:** `css/styles.css` (Main), `css/landing.css`. Uses CSS variables for theming (dark/light mode).
    - **Logic:** `js/script.js` (Main enhancer logic), `js/saved-prompts.js`, `js/prompt-library.js`.
- **Key Responsibilities:**
    - User Interface rendering and interaction.
    - Real-time quality scoring (client-side analysis).
    - API communication (fetch).
    - State management (local storage for theme/preferences).

### 2. Backend Layer (API)
- **Technology:** PHP 7.4+.
- **Structure:** `api/*.php` endpoints.
- **Key Responsibilities:**
    - Request handling and validation.
    - Authentication (Session-based).
    - Database operations.
    - Proxying requests to External AI Services (UncloseAI).

### 3. Data Layer
- **Technology:** SQLite3.
- **Location:** `data/users.db`.
- **Schema:**
    - `users`: Stores user credentials (hashed passwords) and metadata.
    - `saved_prompts`: Stores original and enhanced prompts, linked to users.
- **Access:** Direct file access via PHP `SQLite3` class.

### 4. External Services
- **UncloseAI Hermes:** Third-party LLM API used for prompt enhancement and title generation.
    - **Model:** `Hermes-3-Llama-3.1-8B-FP8-Dynamic`.
    - **Integration:** Accessed via `api/save-prompt.php` (for titles) and direct client-side calls (currently in `js/script.js`, though architecture suggests moving this to backend proxy for security).

## Data Flow

### Prompt Enhancement
1.  User enters prompt in `app.html`.
2.  `js/script.js` captures input and calls `enhancePromptWithUncloseAI`.
3.  **Current:** Frontend calls UncloseAI API directly (Note: This exposes API keys if not proxied. *Architectural Note: Should verify if this is intended or if a proxy is planned*).
4.  Response is parsed and displayed in the UI.

### User Authentication
1.  User submits login/register form.
2.  `js/script.js` sends POST request to `api/login.php` or `api/register.php`.
3.  PHP verifies credentials against `users` table.
4.  Session is established on success.

### Saving Prompts
1.  Authenticated user clicks "Save".
2.  `js/script.js` sends POST to `api/save-prompt.php`.
3.  PHP validates session and saves data to `saved_prompts` table.
4.  PHP optionally calls UncloseAI to generate a title for the saved prompt.

## Key Technical Decisions
- **SQLite:** Chosen for simplicity and zero-configuration deployment. ideal for a standalone tool.
- **Vanilla JS:** Avoids build step complexity (Webpack/Vite) and keeps the project lightweight.
- **PHP Backend:** Widespread availability on shared hosting, making the tool easy to self-host.
- **CSS Variables:** Efficient implementation of dark/light mode without Sass/Less.

## Directory Structure Map
```
PromptRefinery/
├── api/                    # Backend Logic
├── config/                 # Database Config
├── css/                    # Styles
├── data/                   # Database Storage
├── js/                     # Frontend Logic
├── .kilocode/              # Project Documentation (Memory Bank)
└── [html files]            # Views