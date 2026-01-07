    // DOM elements
    const savedPromptsList = document.getElementById('saved-prompts-list');
    const noSavedPrompts = document.getElementById('no-saved-prompts');
    const savedPromptsCount = document.getElementById('saved-prompts-count');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const closeDeleteModalBtn = document.getElementById('close-delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // Saved prompt modal elements
    const savedPromptModal = document.getElementById('saved-prompt-modal');
    const savedModalTitle = document.getElementById('saved-modal-title');
    const savedModalContent = document.getElementById('saved-modal-content');
    const savedModalCopyBtn = document.getElementById('saved-modal-copy-btn');
    const savedModalDeleteBtn = document.getElementById('saved-modal-delete-btn');
    const savedModalCloseBtn = document.getElementById('saved-modal-close-btn');

    // Track current prompt being viewed in modal
    let currentModalPromptId = null;

    // Notification system state
    let activeNotification = null;
    let notificationQueue = [];
    let isNotificationAnimating = false;
    let promptToDelete = null;

    // Store loaded prompts for modal access
    let savedPromptsData = [];

    // Track if currently editing a title (to prevent modal opening)
    let isEditingTitle = false;

    // Open saved prompt modal
    function openSavedPromptModal(prompt) {
        currentModalPromptId = prompt.id;
        savedModalTitle.textContent = prompt.title || 'Untitled Prompt';
        savedModalContent.textContent = prompt.enhanced_prompt;
        savedModalCopyBtn.dataset.prompt = prompt.enhanced_prompt;
        savedPromptModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Load and open prompt modal from saved prompts
    function loadAndOpenPromptModal(promptId) {
        const prompt = savedPromptsData.find(p => p.id === promptId);
        if (prompt) {
            openSavedPromptModal(prompt);
        }
    }

    // Close saved prompt modal
    function closeSavedPromptModal() {
        savedPromptModal.classList.remove('open');
        document.body.style.overflow = '';
    }

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

        if (closeDeleteModalBtn) {
            closeDeleteModalBtn.addEventListener('click', hideDeleteModal);
        }

        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', hideDeleteModal);
        }

        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', confirmDelete);
        }

        if (deleteConfirmModal) {
            deleteConfirmModal.addEventListener('click', (e) => {
                if (e.target === deleteConfirmModal) {
                    hideDeleteModal();
                }
            });
        }

        // Saved prompt modal handlers
        if (savedModalCloseBtn) {
            savedModalCloseBtn.addEventListener('click', closeSavedPromptModal);
        }

        if (savedPromptModal) {
            savedPromptModal.addEventListener('click', (e) => {
                if (e.target === savedPromptModal) {
                    closeSavedPromptModal();
                }
            });
        }

        if (savedModalCopyBtn) {
            savedModalCopyBtn.addEventListener('click', (e) => {
                const text = e.currentTarget.dataset.prompt || '';
                copySavedPrompt(text);
            });
        }

        if (savedModalDeleteBtn) {
            savedModalDeleteBtn.addEventListener('click', () => {
                if (currentModalPromptId) {
                    closeSavedPromptModal();
                    deleteSavedPrompt(currentModalPromptId);
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && savedPromptModal?.classList.contains('open')) {
                closeSavedPromptModal();
            }
        });

        // Click on saved prompt card to open modal
        if (savedPromptsList) {
            savedPromptsList.addEventListener('click', (e) => {
                const card = e.target.closest('.prompt-card');
                if (!card) return;

                // Ignore if clicking on buttons or input fields
                if (e.target.closest('.prompt-btn, .title-action-btn, .saved-prompt-title-input')) return;

                // If currently editing a title, just return - the blur event will save it
                if (isEditingTitle) {
                    return;
                }

                const promptId = parseInt(card.dataset.promptId);
                loadAndOpenPromptModal(promptId);
            });
        }
    }

    // Load and display saved prompts
    async function loadSavedPrompts() {
        console.log('Loading saved prompts...');
        try {
            const response = await fetch('api/get-saved-prompts.php');
            const data = await response.json();

            if (response.ok) {
                savedPromptsData = data.prompts;
                displaySavedPrompts(data.prompts, data.count);
                checkAndMigrateTitles();
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
        const button = e.target.closest('.prompt-btn, .title-action-btn');
        if (!button) return;

        // Stop propagation to prevent modal from opening when clicking buttons
        e.stopPropagation();

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

            case 'edit-title':
                startEditTitle(promptId);
                break;

            case 'regenerate-title':
                regenerateTitle(promptId);
                break;

            default:
                console.warn('Unknown prompt action:', action);
        }
    }

    // Display saved prompts in the grid (matching prompt library layout)
    function displaySavedPrompts(prompts, count) {
        savedPromptsCount.textContent = `${count} / 100 prompts saved`;

        if (prompts.length === 0) {
            savedPromptsList.innerHTML = '';
            noSavedPrompts.style.display = 'block';
            return;
        }

        noSavedPrompts.style.display = 'none';

        savedPromptsList.innerHTML = prompts.map(prompt => `
            <div class="prompt-card saved-prompt-item" data-prompt-id="${prompt.id}">
                <div class="prompt-category">Saved ${formatDate(prompt.created_at)}</div>
                <div class="saved-prompt-header">
                    <div class="saved-prompt-title-container">
                        <span class="saved-prompt-title" data-prompt-id="${prompt.id}">${escapeHtml(prompt.title || 'Untitled Prompt')}</span>
                        <input type="text" class="saved-prompt-title-input hidden" data-prompt-id="${prompt.id}" value="${escapeHtml(prompt.title || '')}" maxlength="100" placeholder="Enter title...">
                    </div>
                    <div class="saved-prompt-title-actions">
                        <button class="title-action-btn" data-action="edit-title" data-prompt-id="${prompt.id}" title="Edit title">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="title-action-btn" data-action="regenerate-title" data-prompt-id="${prompt.id}" title="Regenerate title with AI">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                                <path d="M3 22v-6h6"></path>
                                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                ${prompt.notes ? `<p class="prompt-description">${escapeHtml(prompt.notes)}</p>` : '<p class="prompt-description">Enhanced prompt</p>'}
                <div class="prompt-content">${escapeHtml(prompt.enhanced_prompt)}</div>
                <div class="prompt-actions">
                    <button class="prompt-btn copy-prompt-btn" data-action="copy" data-prompt-id="${prompt.id}" data-enhanced-prompt="${escapeHtml(prompt.enhanced_prompt).replace(/"/g, '&quot;')}" title="Copy to clipboard">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                    <button class="prompt-btn delete-prompt-btn" data-action="delete" data-prompt-id="${prompt.id}" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
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
        promptToDelete = promptId;
        showDeleteModal();
    }

    async function showDeleteModal() {
        if (deleteConfirmModal) {
            deleteConfirmModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                deleteConfirmModal.classList.add('open');
            }, 10);
        }
    }

    function hideDeleteModal() {
        if (deleteConfirmModal) {
            deleteConfirmModal.classList.remove('open');
            setTimeout(() => {
                deleteConfirmModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 200);
        }
        promptToDelete = null;
    }

    async function confirmDelete() {
        if (!promptToDelete) return;

        try {
            const response = await fetch('api/delete-saved-prompt.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt_id: promptToDelete })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Prompt deleted successfully', 'success');
                hideDeleteModal();
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
        // Theme icons visibility is handled by CSS based on data-theme attribute
    }

    // Title management functions

    function startEditTitle(promptId) {
        const titleElement = document.querySelector(`.saved-prompt-title[data-prompt-id="${promptId}"]`);
        const inputElement = document.querySelector(`.saved-prompt-title-input[data-prompt-id="${promptId}"]`);

        if (!titleElement || !inputElement) return;

        // Prevent multiple listeners if already editing
        if (!titleElement.classList.contains('hidden')) {
            // Set the editing flag
            isEditingTitle = true;
            
            titleElement.classList.add('hidden');
            inputElement.classList.remove('hidden');
            inputElement.focus();
            inputElement.select();

            const cleanup = () => {
                inputElement.removeEventListener('blur', handleBlur);
                inputElement.removeEventListener('keydown', handleKeyDown);
            };

            const handleBlur = () => {
                cleanup();
                saveTitle(promptId);
            };

            const handleKeyDown = (e) => {
                if (e.key === 'Enter') {
                    cleanup();
                    saveTitle(promptId);
                } else if (e.key === 'Escape') {
                    cleanup();
                    cancelEditTitle(promptId);
                }
            };

            inputElement.addEventListener('blur', handleBlur);
            inputElement.addEventListener('keydown', handleKeyDown);
        }
    }

    async function saveTitle(promptId) {
        const inputElement = document.querySelector(`.saved-prompt-title-input[data-prompt-id="${promptId}"]`);
        const titleElement = document.querySelector(`.saved-prompt-title[data-prompt-id="${promptId}"]`);
        if (!inputElement || !titleElement) return;

        const newTitle = inputElement.value.trim();

        try {
            const response = await fetch('api/update-title.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt_id: promptId,
                    custom_title: newTitle
                })
            });

            if (response.ok) {
                updateTitleDisplay(promptId, newTitle);
                showNotification('Title updated!', 'success');
                inputElement.classList.add('hidden');
                titleElement.classList.remove('hidden');
            } else {
                showNotification('Failed to update title', 'error');
                cancelEditTitle(promptId);
            }
        } catch (error) {
            console.error('Save title error:', error);
            showNotification('Failed to update title', 'error');
            cancelEditTitle(promptId);
        } finally {
            // Clear the editing flag after a short delay to prevent immediate modal opening
            setTimeout(() => {
                isEditingTitle = false;
            }, 100);
        }
    }

    function cancelEditTitle(promptId) {
        const titleElement = document.querySelector(`.saved-prompt-title[data-prompt-id="${promptId}"]`);
        const inputElement = document.querySelector(`.saved-prompt-title-input[data-prompt-id="${promptId}"]`);

        if (!titleElement || !inputElement) return;

        inputElement.value = titleElement.textContent.trim();

        inputElement.classList.add('hidden');
        titleElement.classList.remove('hidden');
        
        // Clear the editing flag after a short delay to prevent immediate modal opening
        setTimeout(() => {
            isEditingTitle = false;
        }, 100);
    }

    function updateTitleDisplay(promptId, newTitle) {
        const titleElement = document.querySelector(`.saved-prompt-title[data-prompt-id="${promptId}"]`);
        const inputElement = document.querySelector(`.saved-prompt-title-input[data-prompt-id="${promptId}"]`);

        if (!titleElement) return;

        titleElement.textContent = newTitle || 'Untitled Prompt';
        if (inputElement) {
            inputElement.value = newTitle || '';
        }
    }

    async function regenerateTitle(promptId) {
        const button = document.querySelector(`.title-action-btn[data-action="regenerate-title"][data-prompt-id="${promptId}"]`);
        if (button) {
            button.disabled = true;
            button.classList.add('loading');
        }

        try {
            const response = await fetch('api/regenerate-title.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt_id: promptId })
            });

            const data = await response.json();

            if (response.ok) {
                updateTitleDisplay(promptId, data.title);
                showNotification('Title regenerated!', 'success');
            } else {
                showNotification(data.error || 'Failed to regenerate title', 'error');
            }
        } catch (error) {
            console.error('Regenerate title error:', error);
            showNotification('Failed to regenerate title', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.classList.remove('loading');
            }
        }
    }

    async function checkAndMigrateTitles() {
        if (sessionStorage.getItem('titleMigrationChecked')) return;

        try {
            const response = await fetch('api/migrate-titles.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.migrated > 0) {
                    showNotification(`Generated titles for ${data.migrated} prompts!`, 'success');
                    loadSavedPrompts();
                }

                if (data.remaining > 0) {
                    setTimeout(() => checkAndMigrateTitles(), 2000);
                }
            }
        } catch (error) {
            console.error('Migration error:', error);
        } finally {
            sessionStorage.setItem('titleMigrationChecked', 'true');
        }
    }

    // Initialize
    init();
