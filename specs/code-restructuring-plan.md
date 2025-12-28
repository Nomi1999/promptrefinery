# Code Restructuring Plan

## Overview

This document outlines a comprehensive plan to improve the code structure of the Prompt Enhancer web application. The goal is to eliminate code duplication, improve maintainability, and establish clear separation of concerns.

### Current State

| File | Lines | Issues |
|------|-------|--------|
| `css/styles.css` | 2,960 | Monolithic, duplicated theme vars, scattered media queries |
| `js/script.js` | 2,000+ | Handles too many concerns, duplicated utilities |
| `js/prompt-library.js` | 1,356 | Duplicated notification/theme code, embedded data |
| `js/saved-prompts.js` | 613 | Duplicated notification/theme code |
| `index.html` | 637 | Duplicated header, modals, inline SVGs |
| `prompt-library.html` | 290 | Duplicated head, theme script |
| `saved-prompts.html` | 350 | Duplicated head, theme script |

### Target State

- **~500 lines of duplicate JS code eliminated**
- **1 monolithic 2,960-line CSS file split into 16 focused files**
- **~400 lines of duplicate HTML eliminated via PHP includes**
- **Clear separation of concerns throughout**

### Constraints

- **Hosting:** InfinityFree free tier (PHP-only, no Node.js/build tools)
- **Approach:** Vanilla HTML/CSS/JS with PHP includes for templating
- **Version Control:** Git in place for rollback if needed

---

## Phase 2: JavaScript Shared Utilities (Priority: High)

**Goal:** Eliminate duplicated code across the 3 JS files using a shared utilities file.

**Rationale:** This phase has the highest duplication and provides the biggest maintainability win.

### New File Structure

```
js/
├── shared.js             # Shared utilities (loaded first)
├── script.js             # Main app (uses shared.js)
├── prompt-library.js     # Library page (uses shared.js)
└── saved-prompts.js      # Saved prompts (uses shared.js)
```

### Step 2.1: Create `js/shared.js`

Create a new file containing all shared functionality currently duplicated across the 3 JS files:

```javascript
// js/shared.js - Shared utilities for PromptRefinery
const AppUtils = (function() {
    'use strict';
    
    // === NOTIFICATION SYSTEM ===
    let activeNotification = null;
    let notificationQueue = [];
    let isNotificationAnimating = false;
    
    function showNotification(message, type) { ... }
    function displayNotification(message, type) { ... }
    function dismissNotification(notification) { ... }
    
    // === THEME MANAGEMENT ===
    function initTheme() { ... }
    function toggleTheme() { ... }
    function applyTheme(theme) { ... }
    function updateThemeIcons(theme) { ... }
    function updateThemeLogo(theme) { ... }
    
    // === CLIPBOARD ===
    async function copyToClipboard(text, successMessage) { ... }
    
    // === HELPERS ===
    function escapeHtml(text) { ... }
    function formatDate(dateString) { ... }
    function debounce(func, wait) { ... }
    
    // Public API
    return {
        showNotification,
        initTheme,
        toggleTheme,
        copyToClipboard,
        escapeHtml,
        formatDate,
        debounce
    };
})();
```

**Source code locations to extract:**

| Function | Source File | Lines |
|----------|-------------|-------|
| `showNotification` | script.js | 882-894 |
| `displayNotification` | script.js | 896-948 |
| `dismissNotification` | script.js | 950-978 |
| `initTheme` | script.js | 1266-1296 |
| `toggleTheme` | script.js | 1298-1310 |
| `applyTheme` | script.js | 1312-1315 |
| `updateThemeIcons` | script.js | 1317-1328 |
| `updateThemeLogo` | script.js | 1330-1352 |
| `debounce` | script.js | 988-998 |
| `escapeHtml` | saved-prompts.js | 315-319 |
| `formatDate` | saved-prompts.js | 301-312 |

### Step 2.2: Refactor `script.js`

Remove the following sections and replace with `AppUtils.` calls:

| Section | Lines to Remove | Replacement |
|---------|-----------------|-------------|
| Notification system | 882-978 | `AppUtils.showNotification()` |
| Debounce function | 988-998 | `AppUtils.debounce()` |
| Theme management | 1266-1352 | `AppUtils.initTheme()`, `AppUtils.toggleTheme()` |

### Step 2.3: Refactor `prompt-library.js`

Remove the following sections:

| Section | Lines to Remove | Replacement |
|---------|-----------------|-------------|
| Notification system | 1177-1280 | `AppUtils.showNotification()` |
| Theme management | 1281-1352 | `AppUtils.initTheme()`, `AppUtils.toggleTheme()` |

### Step 2.4: Refactor `saved-prompts.js`

Remove the following sections:

| Section | Lines to Remove | Replacement |
|---------|-----------------|-------------|
| `escapeHtml` | 315-319 | `AppUtils.escapeHtml()` |
| `formatDate` | 301-312 | `AppUtils.formatDate()` |
| Notification system | 322-412 | `AppUtils.showNotification()` |
| Theme management | 414-451 | `AppUtils.initTheme()`, `AppUtils.toggleTheme()` |

### Step 2.5: Update HTML Files

Add `<script src="js/shared.js"></script>` before the page-specific scripts in all 3 files:

**index.html (before):**
```html
<script src="js/script.js"></script>
```

**index.html (after):**
```html
<script src="js/shared.js"></script>
<script src="js/script.js"></script>
```

Apply same pattern to `prompt-library.html` and `saved-prompts.html`.

### Step 2.6: Testing Checklist

- [ ] Theme toggle works on all 3 pages
- [ ] Notifications appear correctly on all 3 pages
- [ ] Copy to clipboard works on all 3 pages
- [ ] No console errors on any page

---

## Phase 1: CSS Modularization (Priority: High)

**Goal:** Split the 2,960-line `styles.css` into logical modules for maintainability.

**Approach:** Use CSS `@import` with a main entry file.

### New File Structure

```
css/
├── main.css              # Entry point with @import statements
├── variables.css         # All CSS custom properties (single source of truth)
├── base.css              # Reset, typography, body styles
├── layout.css            # Header, main-wrapper, panels, split-view
├── components/
│   ├── buttons.css       # All button styles
│   ├── forms.css         # Inputs, textareas, form groups
│   ├── modals.css        # Modal backdrop, container, auth modals
│   ├── notifications.css # Toast notifications
│   ├── cards.css         # Prompt cards, saved prompt items
│   ├── temperature.css   # Temperature slider and presets
│   └── quality-score.css # Quality score display
├── features/
│   ├── auth.css          # Auth buttons, sidebar auth, modals
│   ├── sidebar-mobile.css# Mobile sidebar styles
│   └── feedback.css      # Feedback section, tags
├── pages/
│   ├── library.css       # Prompt library specific
│   └── saved-prompts.css # Saved prompts page specific
└── responsive.css        # All media queries consolidated
```

### Step 1.1: Create `css/main.css`

```css
/* Main CSS Entry Point - PromptRefinery */

/* Base */
@import url('variables.css');
@import url('base.css');
@import url('layout.css');

/* Components */
@import url('components/buttons.css');
@import url('components/forms.css');
@import url('components/modals.css');
@import url('components/notifications.css');
@import url('components/cards.css');
@import url('components/temperature.css');
@import url('components/quality-score.css');

/* Features */
@import url('features/auth.css');
@import url('features/sidebar-mobile.css');
@import url('features/feedback.css');

/* Page-specific */
@import url('pages/library.css');
@import url('pages/saved-prompts.css');

/* Responsive (last to ensure proper cascade) */
@import url('responsive.css');
```

### Step 1.2: Extract CSS Sections

| New File | Source Lines | Content Description |
|----------|--------------|---------------------|
| `variables.css` | 1-52, 2756-2819 | CSS custom properties for both themes (consolidated) |
| `base.css` | 951-980 | Reset, body, typography, scrollbar |
| `layout.css` | 982-1180 | Header, main-wrapper, panels, split-view |
| `components/buttons.css` | 1722-1812 | icon-btn, enhance-btn, reset-btn, action buttons |
| `components/forms.css` | 761-843, 1460-1576 | form-group, inputs, textareas, labels |
| `components/modals.css` | 700-760, 2412-2519 | Modal backdrop, container, header, body, footer |
| `components/notifications.css` | 1848-2153 | Toast notifications, close button, animations |
| `components/cards.css` | 2286-2410 | prompt-card, prompt-actions, prompt-btn |
| `components/temperature.css` | 1298-1458 | Temperature slider, presets, range input |
| `components/quality-score.css` | 1205-1296 | Quality score container, bar, labels |
| `features/auth.css` | 397-699 | Auth buttons, auth-required, sidebar auth section |
| `features/feedback.css` | 1578-1707 | Feedback section, toggle, tags |
| `pages/library.css` | 2171-2284 | Library container, header, controls, grid |
| `pages/saved-prompts.css` | 86-243 | Saved prompts title editing, actions |
| `responsive.css` | 2520-2960 | All @media queries (consolidated) |

### Step 1.3: Consolidate Theme Variables

The current `styles.css` has theme variables defined in 4 places:
- Lines 1-52 (`:root`)
- Lines 54-84 (`@media (prefers-color-scheme: dark)`)
- Lines 2756-2787 (`[data-theme="light"]`)
- Lines 2789-2819 (`[data-theme="dark"]`)

**Consolidate into `variables.css`:**

```css
/* variables.css - Single source of truth for theme variables */

:root {
    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    /* ... other non-color variables ... */
}

[data-theme="light"] {
    --primary: #0f766e;
    --primary-hover: #115e59;
    /* ... all light theme colors ... */
}

[data-theme="dark"] {
    --primary: #2dd4bf;
    --primary-hover: #5eead4;
    /* ... all dark theme colors ... */
}
```

### Step 1.4: Update HTML Files

Replace the CSS link in all HTML files:

**Before:**
```html
<link rel="stylesheet" href="css/styles.css">
```

**After:**
```html
<link rel="stylesheet" href="css/main.css">
```

### Step 1.5: Testing Checklist

- [ ] All pages render correctly in light mode
- [ ] All pages render correctly in dark mode
- [ ] Theme toggle transitions work smoothly
- [ ] All responsive breakpoints work correctly
- [ ] No missing styles on any component
- [ ] Modal overlays work correctly
- [ ] Notifications display properly

---

## Phase 3: PHP Templating (Priority: Medium)

**Goal:** Eliminate duplicated HTML using PHP includes.

### New File Structure

```
includes/
├── head.php              # <head> contents (meta, CSS, theme script)
├── header.php            # Site header with logo, auth buttons
├── sidebar.php           # Sidebar navigation (for index.php)
├── auth-modals.php       # Login/Register modals
├── profile-modals.php    # Profile/Delete account modals
└── scripts.php           # Common script includes
```

### Step 3.1: Create `includes/head.php`

**Source:** Extract from `index.html` lines 3-27

```php
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Transform basic prompts into powerful, optimized instructions for AI assistants.">
<link rel="icon" type="image/webp" href="assets/images/favicon.webp">
<link rel="stylesheet" href="css/main.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script>
    (function() {
        try {
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {
            console.error('Theme initialization failed:', e);
        }
    })();
</script>
```

### Step 3.2: Create `includes/header.php`

**Source:** Extract from `index.html` lines 28-86

Contains:
- Logo with theme-aware image
- Header content (title, tagline)
- Header actions (auth buttons, theme toggle, mobile menu)

### Step 3.3: Create `includes/sidebar.php`

**Source:** Extract from `index.html` lines 89-249

Contains:
- Mobile header with close button
- Navigation menu (Prompt Library, Saved Prompts)
- Category links
- Sidebar auth section

### Step 3.4: Create `includes/auth-modals.php`

**Source:** Extract from `index.html` lines 425-502

Contains:
- Login modal
- Register modal

### Step 3.5: Create `includes/profile-modals.php`

**Source:** Extract from `index.html` lines 507-633

Contains:
- Profile modal (change password, delete account)
- Delete confirmation modal

### Step 3.6: Rename HTML Files to PHP

| Original | New Name |
|----------|----------|
| `index.html` | `index.php` |
| `prompt-library.html` | `prompt-library.php` |
| `saved-prompts.html` | `saved-prompts.php` |

### Step 3.7: Update `index.php` with Includes

**Before (index.html):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>PromptRefinery</title>
    <!-- 25 lines of head content -->
</head>
<body class="app-main">
    <!-- 60 lines of header -->
    <!-- 160 lines of sidebar -->
    <!-- main content -->
    <!-- 200 lines of modals -->
</body>
</html>
```

**After (index.php):**
```php
<!DOCTYPE html>
<html lang="en">
<head>
    <title>PromptRefinery - AI Prompt Enhancer</title>
    <?php include 'includes/head.php'; ?>
</head>
<body class="app-main">
    <div class="app-container">
        <?php include 'includes/header.php'; ?>
        
        <div class="main-wrapper">
            <?php include 'includes/sidebar.php'; ?>
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
            
            <!-- Main content (page-specific) -->
            <main class="main-content">
                <!-- ... -->
            </main>
        </div>
    </div>
    
    <?php include 'includes/auth-modals.php'; ?>
    <?php include 'includes/profile-modals.php'; ?>
    
    <script src="js/shared.js"></script>
    <script src="js/script.js"></script>
</body>
</html>
```

### Step 3.8: Update All Internal Links

Update all references from `.html` to `.php`:

| Location | Change |
|----------|--------|
| `includes/sidebar.php` | `href="prompt-library.html"` → `href="prompt-library.php"` |
| `includes/sidebar.php` | `href="saved-prompts.html"` → `href="saved-prompts.php"` |
| `includes/sidebar.php` | `href="index.html"` → `href="index.php"` |
| `prompt-library.php` | Back button href |
| `saved-prompts.php` | Back button href |
| `js/script.js` | Any `window.location.href` redirects |
| `js/prompt-library.js` | `window.location.href = 'index.html'` → `'index.php'` |
| `js/saved-prompts.js` | Any redirects |

### Step 3.9: Update `.htaccess` for Redirects

Add redirects for SEO and existing bookmarks:

```apache
# Redirect old .html URLs to new .php URLs
RedirectMatch 301 ^/index\.html$ /index.php
RedirectMatch 301 ^/prompt-library\.html$ /prompt-library.php
RedirectMatch 301 ^/saved-prompts\.html$ /saved-prompts.php
```

### Step 3.10: Testing Checklist

- [ ] All pages load without PHP errors
- [ ] Navigation between pages works
- [ ] Auth modals open and function correctly
- [ ] Profile modal works
- [ ] Theme persists across page navigation
- [ ] Old .html URLs redirect to .php
- [ ] Mobile sidebar works
- [ ] All JavaScript functionality intact

---

## Phase 4: Data Extraction (Priority: Low)

**Goal:** Move static prompt templates data out of JavaScript.

### Step 4.1: Create `data/prompt-templates.json`

**Source:** Extract from `prompt-library.js` lines 16-926

```json
[
    {
        "id": 1,
        "category": "creative",
        "title": "Story Character Development",
        "description": "Create detailed and compelling characters...",
        "content": "Create a detailed character profile..."
    },
    // ... 59 more templates
]
```

### Step 4.2: Update `prompt-library.js`

**Before:**
```javascript
const promptTemplates = [
    { id: 1, category: 'creative', ... },
    // ... 900 lines of data
];

function init() {
    // uses promptTemplates directly
}
```

**After:**
```javascript
let promptTemplates = [];

async function loadPromptTemplates() {
    try {
        const response = await fetch('data/prompt-templates.json');
        if (!response.ok) throw new Error('Failed to load templates');
        promptTemplates = await response.json();
        return promptTemplates;
    } catch (error) {
        console.error('Error loading prompt templates:', error);
        AppUtils.showNotification('Failed to load prompt templates', 'error');
        return [];
    }
}

async function init() {
    AppUtils.initTheme();
    await loadPromptTemplates();
    // rest of initialization
}
```

### Step 4.3: Testing Checklist

- [ ] Prompt library page loads templates correctly
- [ ] Search and filter work correctly
- [ ] Category counts display correctly
- [ ] No console errors
- [ ] Templates load quickly (check network tab)

---

## Execution Order

```
Week 1: Phase 2 (JavaScript Shared Utilities)
        ├── Create js/shared.js
        ├── Refactor all 3 page scripts
        ├── Update HTML files
        └── Test thoroughly

Week 2: Phase 1 (CSS Modularization)
        ├── Create directory structure
        ├── Extract all CSS sections
        ├── Create main.css with imports
        ├── Update HTML files
        └── Test all pages and themes

Week 3: Phase 3 (PHP Templating)
        ├── Create includes directory
        ├── Create all include files
        ├── Rename HTML to PHP
        ├── Update all internal links
        ├── Add .htaccess redirects
        └── Test thoroughly

Week 4: Phase 4 (Data Extraction)
        ├── Create prompt-templates.json
        ├── Update prompt-library.js
        └── Test
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes during refactor | Git version control in place for rollback |
| CSS specificity issues after split | Keep same selector order when extracting |
| JS load order issues | Ensure `shared.js` loads before page scripts |
| Broken links after .html → .php rename | Add `.htaccess` redirects |
| PHP include path issues on InfinityFree | Use relative paths from document root |

---

## Estimated Results

### Line Count Changes

| File | Before | After | Change |
|------|--------|-------|--------|
| `styles.css` | 2,960 | 0 (archived) | Split into 16 files |
| `css/main.css` | - | ~50 | New entry point |
| `js/shared.js` | - | ~250 | New shared utilities |
| `js/script.js` | 2,000+ | ~1,600 | -400 lines |
| `js/prompt-library.js` | 1,356 | ~500 | -856 lines |
| `js/saved-prompts.js` | 613 | ~450 | -163 lines |
| `index.php` | 637 | ~200 | -437 lines (includes) |

### Maintainability Improvements

- **Single source of truth** for notifications, themes, and utilities
- **Modular CSS** - easy to find and update specific styles
- **Reusable HTML components** - change header once, updates everywhere
- **Separated data** - easy to add/modify prompt templates
- **Clear file organization** - intuitive project structure

---

## Final Checklist

```
□ Phase 2: JavaScript
  □ 2.1 Create js/shared.js
  □ 2.2 Refactor script.js to use AppUtils
  □ 2.3 Refactor prompt-library.js to use AppUtils
  □ 2.4 Refactor saved-prompts.js to use AppUtils
  □ 2.5 Update HTML files to include shared.js
  □ 2.6 Test all pages

□ Phase 1: CSS
  □ 1.1 Create css/ subdirectories
  □ 1.2 Create variables.css
  □ 1.3 Create base.css
  □ 1.4 Create layout.css
  □ 1.5 Create all component CSS files
  □ 1.6 Create feature CSS files
  □ 1.7 Create page-specific CSS files
  □ 1.8 Create responsive.css
  □ 1.9 Create main.css with @imports
  □ 1.10 Update HTML files to use main.css
  □ 1.11 Test all pages

□ Phase 3: PHP Templating
  □ 3.1 Create includes/ directory
  □ 3.2 Create head.php
  □ 3.3 Create header.php
  □ 3.4 Create sidebar.php
  □ 3.5 Create auth-modals.php
  □ 3.6 Create profile-modals.php
  □ 3.7 Rename index.html → index.php
  □ 3.8 Rename prompt-library.html → prompt-library.php
  □ 3.9 Rename saved-prompts.html → saved-prompts.php
  □ 3.10 Update all internal links
  □ 3.11 Update .htaccess with redirects
  □ 3.12 Test all pages

□ Phase 4: Data Extraction
  □ 4.1 Create data/prompt-templates.json
  □ 4.2 Update prompt-library.js to fetch JSON
  □ 4.3 Test prompt library page
```
