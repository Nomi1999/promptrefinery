    // DOM elements
    const savedPromptsList = document.getElementById('saved-prompts-list');
    const noSavedPrompts = document.getElementById('no-saved-prompts');
    const savedPromptsCount = document.getElementById('saved-prompts-count');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Notification system state
    let activeNotification = null;
    let notificationQueue = [];
    let isNotificationAnimating = false;

    // Initialize the saved prompts page
    function init() {
        initTheme();
        setupEventListeners();
        loadSavedPrompts();
    }

    // Setup event listeners
    function setupEventListeners() {
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }

        if (savedPromptsList) {
            savedPromptsList.addEventListener('click', handlePromptAction);
        }
    }

    // Load and display saved prompts
    async function loadSavedPrompts() {
        console.log('Loading saved prompts...');
        try {
            const response = await fetch('api/get-saved-prompts.php');
            const data = await response.json();

            if (response.ok) {
                displaySavedPrompts(data.prompts, data.count);
            } else {
                showNotification('Failed to load saved prompts', 'error');
            }
        } catch (error) {
            console.error('Load error:', error);
            showNotification('Failed to load saved prompts', 'error');
        }
    }

    // Handle saved prompt action clicks (event delegation)
    function handlePromptAction(e) {
        const button = e.target.closest('.prompt-action-btn');
        if (!button) return;

        const action = button.dataset.action;
        const promptId = parseInt(button.dataset.promptId);
        const enhancedPrompt = button.dataset.enhancedPrompt || '';

        switch (action) {
            case 'copy':
                copySavedPrompt(enhancedPrompt);
                break;

            case 'delete':
                deleteSavedPrompt(promptId);
                break;

            default:
                console.warn('Unknown prompt action:', action);
        }
    }

    // Display saved prompts in the list
    function displaySavedPrompts(prompts, count) {
        savedPromptsCount.textContent = `${count} / 100 prompts saved`;

        if (prompts.length === 0) {
            savedPromptsList.innerHTML = '';
            noSavedPrompts.style.display = 'block';
            return;
        }

        noSavedPrompts.style.display = 'none';

        savedPromptsList.innerHTML = prompts.map(prompt => `
            <div class="saved-prompt-item" data-prompt-id="${prompt.id}">
                <div class="saved-prompt-content">${escapeHtml(prompt.enhanced_prompt)}</div>
                ${prompt.notes ? `<div class="saved-prompt-notes">${escapeHtml(prompt.notes)}</div>` : ''}
                <div class="saved-prompt-meta">
                    <span>Saved ${formatDate(prompt.created_at)}</span>
                    <div class="saved-prompt-actions">
                        <button class="saved-prompt-btn copy-saved-btn" data-action="copy" data-prompt-id="${prompt.id}" data-enhanced-prompt="${escapeHtml(prompt.enhanced_prompt).replace(/"/g, '&quot;')}" title="Copy to clipboard">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy
                        </button>
                        <button class="saved-prompt-btn delete-saved-btn" data-action="delete" data-prompt-id="${prompt.id}" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Copy saved prompt to clipboard
    async function copySavedPrompt(text) {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Prompt copied to clipboard!', 'success');
        } catch (err) {
            console.error('Copy failed:', err);
            showNotification('Failed to copy prompt', 'error');
        }
    }

    // Delete a saved prompt
    async function deleteSavedPrompt(promptId) {
        if (!confirm('Are you sure you want to delete this saved prompt?')) {
            return;
        }

        try {
            const response = await fetch('api/delete-saved-prompt.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt_id: promptId })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Prompt deleted successfully', 'success');
                loadSavedPrompts();
            } else {
                showNotification(data.error || 'Failed to delete prompt', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('Failed to delete prompt', 'error');
        }
    }

    // Format date as "X days ago"
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;

        return date.toLocaleDateString();
    }

    // Escape HTML for safe rendering
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // Notification system
    function showNotification(message, type = 'success') {
        // If we are currently animating a transition, queue the new notification
        if (isNotificationAnimating) {
            notificationQueue.push({ message, type });
            return;
        }

        // If there is an active notification, dismiss it first
        if (activeNotification) {
            notificationQueue.push({ message, type });
            dismissNotification(activeNotification);
            return;
        }

        // Otherwise show immediately
        displayNotification(message, type);
    }

    // Internal function to display the notification
    function displayNotification(message, type) {
        isNotificationAnimating = true;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const messageContainer = document.createElement('span');
        messageContainer.textContent = message;
        messageContainer.style.flex = '1';
        messageContainer.style.paddingRight = '0.5rem';

        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;

        closeButton.addEventListener('click', () => {
            dismissNotification(notification);
        });

        notification.appendChild(messageContainer);
        notification.appendChild(closeButton);

        document.body.appendChild(notification);
        activeNotification = notification;

        setTimeout(() => {
            isNotificationAnimating = false;
            if (notificationQueue.length > 0) {
                dismissNotification(notification);
            }
        }, 350);

        const autoRemoveTimeout = setTimeout(() => {
            dismissNotification(notification);
        }, 3000);

        notification.dataset.timeoutId = autoRemoveTimeout;
    }

    function dismissNotification(notification) {
        if (!notification || notification.classList.contains('slide-out')) return;

        if (notification.dataset.timeoutId) {
            clearTimeout(parseInt(notification.dataset.timeoutId));
        }

        isNotificationAnimating = true;
        notification.classList.add('slide-out');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }

            if (activeNotification === notification) {
                activeNotification = null;
            }

            isNotificationAnimating = false;

            if (notificationQueue.length > 0) {
                const next = notificationQueue.shift();
                displayNotification(next.message, next.type);
            }
        }, 300);
    }

    // Theme management
    function initTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        updateThemeIcons(currentTheme);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                applyTheme(newTheme);
            }
        });
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info');
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcons(theme);
    }

    function updateThemeIcons(theme) {
        if (theme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }
    }

    // Initialize
    init();
