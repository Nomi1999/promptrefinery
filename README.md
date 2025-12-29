# PromptRefinery

PromptRefinery is a powerful web application designed to help users refine and enhance their AI prompts. Leveraging advanced LLM technology (UncloseAI Hermes), it transforms basic instructions into structured, high-quality prompts to elicit better responses from AI models. The application also features a prompt library, user accounts for saving prompts, and real-time quality scoring.

## Features

### 🚀 Core Functionality
- **AI Prompt Enhancement:** intelligently rewrites prompts to include context, specificity, and better structure.
- **Creativity Control:** Adjustable "Temperature" slider with presets (Precise, Balanced, Creative, Max) to control the AI's enhancement style.
- **Real-time Quality Score:** Analyzes your prompt as you type, scoring it based on clarity, context, constraints, and more.
- **Feedback System:** Provides specific, actionable feedback on *why* the prompt was improved (e.g., "Added context," "Clarified constraints").

### 📚 Resources & Management
- **Prompt Library:** A curated collection of 50+ ready-to-use templates across categories like Creative Writing, Business, Technical, Education, and Productivity.
- **Saved Prompts:** Authenticated users can save their enhanced prompts for later use.
- **Auto-Generated Titles:** AI automatically generates descriptive titles for saved prompts.
- **Export & Copy:** Easy one-click copying of original or enhanced prompts.

### 👤 User System
- **Authentication:** Secure Register and Login system.
- **Profile Management:** Update password or delete account.
- **Personalized Data:** Saved prompts are linked privately to each user account.

### 🎨 UI/UX
- **Responsive Design:** Fully optimized for desktop and mobile devices.
- **Dark/Light Mode:** Toggleable theme with local storage persistence.
- **Modern Interface:** Clean, distraction-free interface built with vanilla CSS and JavaScript.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP
- **Database:** SQLite3
- **AI Integration:** UncloseAI Hermes Model (`Hermes-3-Llama-3.1-8B-FP8-Dynamic`)

## Installation & Setup

1.  **Prerequisites:**
    - A web server with PHP support (e.g., Apache, Nginx, or PHP's built-in server).
    - PHP 7.4 or higher with `sqlite3` extension enabled.

2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yourusername/prompt-refinery.git
    cd prompt-refinery
    ```

3.  **Directory Permissions:**
    Ensure the web server has write permissions to the `data/` directory, as this is where the SQLite database (`users.db`) will be created automatically.

4.  **Running Locally:**
    You can use PHP's built-in server for quick testing:
    ```bash
    php -S localhost:8000
    ```
    Then open `http://localhost:8000` in your browser.

## Project Structure

```text
PromptRefinery/
├── api/                    # PHP backend endpoints
│   ├── auth-check.php      # Session verification
│   ├── login.php           # User login
│   ├── register.php        # User registration
│   ├── save-prompt.php     # Save prompt to DB
│   └── ...                 # Other API handlers
├── assets/                 # Static assets (images, icons)
├── config/                 # Configuration files
│   └── database.php        # Database connection & schema setup
├── css/                    # Stylesheets
│   └── styles.css          # Main application styles
├── data/                   # Data storage (auto-generated)
│   └── users.db            # SQLite database file
├── js/                     # Frontend logic
│   ├── script.js           # Main enhancer logic
│   ├── prompt-library.js   # Library page logic
│   └── saved-prompts.js    # Saved prompts management
├── index.html              # Main application entry point
├── prompt-library.html     # Public prompt templates page
└── saved-prompts.html      # User's saved prompts page
```

## Usage

1.  **Enhance a Prompt:**
    - Go to the home page (`index.html`).
    - Enter your "Core Instruction" (e.g., "Write a blog post").
    - Optionally add "Context & Background".
    - Adjust the creativity slider if needed.
    - Click **Enhance**.

2.  **Save a Prompt:**
    - Create an account or log in.
    - After enhancing a prompt, click the **Save** icon.
    - View your collection in the "My Saved Prompts" page.

3.  **Use the Library:**
    - Navigate to the **Prompt Library**.
    - Filter by category (Creative, Technical, etc.) or search.
    - Click **Use This Prompt** to load it directly into the enhancer.

## License

This project is open-source and available under the MIT License.
