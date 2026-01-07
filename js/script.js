document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const promptInput = document.getElementById('prompt-input');
    const contextInput = document.getElementById('context-input');
    const promptOutput = document.getElementById('prompt-output');
    const enhanceBtn = document.getElementById('enhance-btn');
    const resetBtn = document.getElementById('reset-btn');
    const copyInputBtn = document.getElementById('copy-input-btn');
    const copyOutputBtn = document.getElementById('copy-output-btn');
    // Removed statusMessage element reference as we use floating notifications now
    const inputCharCount = document.getElementById('input-char-count');
    const enhancementTime = document.getElementById('enhancement-time');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');
    const inputQualityScore = document.getElementById('input-quality-score');
    const outputQualityScore = document.getElementById('output-quality-score');
    const inputScoreFill = document.getElementById('input-score-fill');
    const outputScoreFill = document.getElementById('output-score-fill');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    // Feedback Elements
    const feedbackToggle = document.getElementById('feedback-toggle');
    const feedbackContent = document.getElementById('feedback-content');
    const feedbackBody = document.getElementById('feedback-body');

    // Saved Prompts Elements
    const savePromptBtn = document.getElementById('save-prompt-btn');
    
    // Profile Management Elements
    const profileBtn = document.getElementById('profile-btn');
    const viewProfileLink = document.getElementById('view-profile');
    const sidebarMyAccount = document.getElementById('sidebar-my-account');

    // Modal Elements
    const profileModal = document.getElementById('profile-modal');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const closeProfileModalBtn = document.getElementById('close-profile-modal');
    const closeDeleteModalBtn = document.getElementById('close-delete-modal');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const passwordForm = document.getElementById('password-form');
    const deleteAccountForm = document.getElementById('delete-account-form');

    // Temperature Control Elements
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');
    const temperatureFill = document.getElementById('temperature-fill');
    const presetBtns = document.querySelectorAll('.preset-btn');
    
    // Mobile Menu Elements
    const menuToggleBtn = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

    // Mobile Tab Elements
    const mobileTabNav = document.getElementById('mobile-tab-nav');
    const tabInput = document.getElementById('tab-input');
    const tabOutput = document.getElementById('tab-output');
    const inputPanel = document.querySelector('.input-panel');
    const outputPanel = document.querySelector('.output-panel');

    // State management
    let isProcessing = false;
    let currentTemperature = 0.3;

    // Notification system state
    let activeNotification = null;
    let notificationQueue = [];
    let isNotificationAnimating = false;

    // Swipe Handler Class
    class SwipeHandler {
        constructor(element, options = {}) {
            this.element = element;
            this.threshold = options.threshold || 50;
            this.onSwipeLeft = options.onSwipeLeft || (() => {});
            this.onSwipeRight = options.onSwipeRight || (() => {});

            this.startX = 0;
            this.startY = 0;

            this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
            this.element.addEventListener('touchend', this.handleEnd.bind(this), { passive: true });
        }

        handleStart(e) {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        }

        handleEnd(e) {
            const deltaX = e.changedTouches[0].clientX - this.startX;
            const deltaY = e.changedTouches[0].clientY - this.startY;

            // Only trigger if horizontal swipe is dominant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.threshold) {
                if (deltaX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
        }
    }

    // Focus Trap Class for Modal Accessibility
    class FocusTrap {
        constructor(element) {
            this.element = element;
            this.focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            this.firstFocusable = this.focusableElements[0];
            this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];

            this.handleKeyDown = this.handleKeyDown.bind(this);
        }

        activate() {
            this.element.addEventListener('keydown', this.handleKeyDown);
            this.firstFocusable?.focus();
        }

        deactivate() {
            this.element.removeEventListener('keydown', this.handleKeyDown);
        }

        handleKeyDown(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === this.firstFocusable) {
                    e.preventDefault();
                    this.lastFocusable?.focus();
                }
            } else {
                if (document.activeElement === this.lastFocusable) {
                    e.preventDefault();
                    this.firstFocusable?.focus();
                }
            }
        }
    }

    // Temperature ranges for presets
    const temperatureRanges = {
        precise: { min: 0.0, max: 0.2, optimal: 0.1 },
        balanced: { min: 0.3, max: 0.5, optimal: 0.4 },
        creative: { min: 0.6, max: 0.8, optimal: 0.7 },
        max: { min: 0.9, max: 1.0, optimal: 0.95 }
    };

    // Initialize the application
    function init() {
        initTheme();
        initTemperatureControl();
        setupEventListeners();
        checkUncloseAIAvailability();
        updateEnhanceButtonState();
        loadPromptFromLibrary();
    }

    // Initialize temperature control
    function initTemperatureControl() {
        // Always reset to default temperature on page refresh
        currentTemperature = 0.3; // Default value
        
        updateTemperatureUI();
        
        // Add event listeners for temperature controls
        if (temperatureSlider) {
            temperatureSlider.addEventListener('input', handleTemperatureSliderChange);
        }
        
        presetBtns.forEach(btn => {
            btn.addEventListener('click', handlePresetClick);
        });
    }

    // Handle temperature slider change
    function handleTemperatureSliderChange() {
        const sliderValue = parseInt(temperatureSlider.value);
        currentTemperature = sliderValue / 100;
        updateTemperatureUI();
        saveTemperatureToStorage();
        updateActivePreset();
    }

    // Handle preset button click
    function handlePresetClick(e) {
        const presetType = e.target.dataset.preset || e.target.textContent.toLowerCase();
        let targetTemperature;
        
        // Find the optimal temperature for this preset type
        switch(presetType) {
            case 'precise':
                targetTemperature = temperatureRanges.precise.optimal;
                break;
            case 'balanced':
                targetTemperature = temperatureRanges.balanced.optimal;
                break;
            case 'creative':
                targetTemperature = temperatureRanges.creative.optimal;
                break;
            case 'max':
                targetTemperature = temperatureRanges.max.optimal;
                break;
            default:
                // Fallback to data-temperature if available
                targetTemperature = parseFloat(e.target.dataset.temperature) || 0.3;
        }
        
        currentTemperature = targetTemperature;
        updateTemperatureUI();
        saveTemperatureToStorage();
        updateActivePreset();
    }

    // Update temperature UI elements
    function updateTemperatureUI() {
        const sliderValue = Math.round(currentTemperature * 100);

        if (temperatureSlider) {
            temperatureSlider.value = sliderValue;
        }

        if (temperatureValue) {
            temperatureValue.textContent = currentTemperature.toFixed(1);
        }

        if (temperatureFill) {
            // Account for thumb width (20px) - fill should stop at thumb center
            // At 0%, thumb center is at 10px; at 100%, thumb center is at (100% - 10px)
            const thumbWidth = 20;
            const halfThumb = thumbWidth / 2;
            temperatureFill.style.width = `calc(${halfThumb}px + (100% - ${thumbWidth}px) * ${sliderValue / 100})`;
            temperatureFill.style.setProperty('--fill-percent', (currentTemperature || 0.01).toString());
        }

        // Update tooltip
        const tooltip = document.getElementById('temperature-tooltip');
        if (tooltip) {
            tooltip.textContent = currentTemperature.toFixed(1);
            // Use calc to match thumb position accounting for thumb width
            tooltip.style.setProperty('--thumb-position', `calc(10px + (100% - 20px) * ${sliderValue / 100})`);
        }
    }

    // Update active preset button based on temperature ranges
    function updateActivePreset() {
        presetBtns.forEach(btn => {
            const presetType = btn.dataset.preset || btn.textContent.toLowerCase();
            let isActive = false;
            
            // Check if current temperature falls within this preset's range
            switch(presetType) {
                case 'precise':
                    isActive = currentTemperature >= temperatureRanges.precise.min && 
                               currentTemperature <= temperatureRanges.precise.max;
                    break;
                case 'balanced':
                    isActive = currentTemperature >= temperatureRanges.balanced.min && 
                               currentTemperature <= temperatureRanges.balanced.max;
                    break;
                case 'creative':
                    isActive = currentTemperature >= temperatureRanges.creative.min && 
                               currentTemperature <= temperatureRanges.creative.max;
                    break;
                case 'max':
                    isActive = currentTemperature >= temperatureRanges.max.min && 
                               currentTemperature <= temperatureRanges.max.max;
                    break;
                default:
                    // Fallback to exact match for any unrecognized presets
                    const presetTemp = parseFloat(btn.dataset.temperature);
                    isActive = Math.abs(presetTemp - currentTemperature) < 0.05;
            }
            
            if (isActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Save temperature to localStorage
    function saveTemperatureToStorage() {
        localStorage.setItem('temperature', currentTemperature.toString());
    }

    // Check if UncloseAI library is loaded
    function checkUncloseAIAvailability() {
        // We'll use direct API calls to UncloseAI endpoints
        console.log('UncloseAI API integration ready');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Mobile Menu Events
        if (menuToggleBtn && sidebar && sidebarOverlay) {
            menuToggleBtn.addEventListener('click', toggleMobileMenu);
            sidebarOverlay.addEventListener('click', closeMobileMenu);
            if (sidebarCloseBtn) {
                sidebarCloseBtn.addEventListener('click', closeMobileMenu);
            }
            
            // Close menu when clicking a link
            const sidebarLinks = document.querySelectorAll('.sidebar-link');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }

        // Input field events
        [promptInput, contextInput].forEach(input => {
            if (input) {
                input.addEventListener('input', handleInputChange);
                input.addEventListener('paste', () => {
                    setTimeout(updateEnhanceButtonState, 10);
                });
            }
        });

        // Output field events
        if (promptOutput) {
            promptOutput.addEventListener('input', handleOutputChange);
        }

        // Button events
        enhanceBtn.addEventListener('click', handleEnhancePrompt);
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }
        resetBtn.addEventListener('click', handleResetSession);
        copyInputBtn.addEventListener('click', () => copyToClipboard(getCombinedPrompt(), 'input'));
        copyOutputBtn.addEventListener('click', () => copyToClipboard(promptOutput.value, 'output'));
        
        // Feedback toggle
        if (feedbackToggle) {
            feedbackToggle.addEventListener('click', toggleFeedback);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to enhance
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isProcessing) {
                e.preventDefault();
                handleEnhancePrompt();
            }
            // Escape to clear focus
            if (e.key === 'Escape') {
                promptInput.blur();
                contextInput.blur();
                promptOutput.blur();
            }
        });
    }

    // Mobile Menu Functions
    function toggleMobileMenu() {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Mobile Tab Navigation Functions
    function initMobileTabs() {
        // Only initialize if mobile tab elements exist
        if (!mobileTabNav || !tabInput || !tabOutput || !inputPanel || !outputPanel) {
            return;
        }

        // Set initial state - show input panel by default
        updateMobileTabView('input');

        // Add click listeners for tabs
        tabInput.addEventListener('click', () => switchMobileTab('input'));
        tabOutput.addEventListener('click', () => switchMobileTab('output'));

        // Initialize tab indicator animation
        updateTabIndicator();

        // Initialize swipe gesture handling
        if (mobileTabNav && window.innerWidth <= 768) {
            const swipeHandler = new SwipeHandler(mobileTabNav, {
                threshold: 50,
                onSwipeLeft: () => switchMobileTab('output'),
                onSwipeRight: () => switchMobileTab('input')
            });
        }

        // Handle window resize to reset panel visibility on desktop
        window.addEventListener('resize', handleMobileTabResize);
    }

    function switchMobileTab(tabName) {
        if (!mobileTabNav) return;

        // Update active tab button
        if (tabName === 'input') {
            tabInput.classList.add('active');
            tabOutput.classList.remove('active');
        } else {
            tabOutput.classList.add('active');
            tabInput.classList.remove('active');
        }

        // Update panel visibility
        updateMobileTabView(tabName);

        // Update tab indicator animation
        updateTabIndicator();
    }

    function updateTabIndicator() {
        if (!mobileTabNav || !tabInput || !tabOutput) return;

        const activeTab = tabInput.classList.contains('active') ? tabInput : tabOutput;
        const navRect = mobileTabNav.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();

        // Calculate position and width
        const left = tabRect.left - navRect.left;
        const width = tabRect.width;

        // Set CSS variables for animation
        mobileTabNav.style.setProperty('--tab-left', `${left}px`);
        mobileTabNav.style.setProperty('--tab-width', `${width}px`);
    }

    function updateMobileTabView(activeTab) {
        if (!inputPanel || !outputPanel) return;

        // Check if we're in mobile view
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            if (activeTab === 'input') {
                inputPanel.classList.add('mobile-visible');
                outputPanel.classList.remove('mobile-visible');
            } else {
                outputPanel.classList.add('mobile-visible');
                inputPanel.classList.remove('mobile-visible');
            }
        } else {
            // On desktop, both panels should be visible (remove mobile classes)
            inputPanel.classList.remove('mobile-visible');
            outputPanel.classList.remove('mobile-visible');
        }
    }

    function handleMobileTabResize() {
        const isMobile = window.innerWidth <= 768;

        if (!isMobile) {
            // On desktop, ensure both panels are visible
            if (inputPanel) inputPanel.classList.remove('mobile-visible');
            if (outputPanel) outputPanel.classList.remove('mobile-visible');
        } else {
            // On mobile, apply current tab state
            const activeTab = tabInput && tabInput.classList.contains('active') ? 'input' : 'output';
            updateMobileTabView(activeTab);

            // Update tab indicator
            updateTabIndicator();
        }
    }

    // Switch to output tab and add indicator when enhanced content is available
    function showEnhancedOutputTab() {
        if (!mobileTabNav) return;

        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Switch to output tab
            switchMobileTab('output');
            
            // Add visual indicator that there's new content
            if (tabOutput) {
                tabOutput.classList.add('has-content');
                
                // Remove the indicator after a few seconds
                setTimeout(() => {
                    tabOutput.classList.remove('has-content');
                }, 5000);
            }
        }
    }

    // Helper to combine all input fields
    function getCombinedPrompt() {
        let parts = [];
        
        const core = promptInput.value.trim();
        const context = contextInput ? contextInput.value.trim() : '';
        
        if (core) parts.push(core);
        if (context) parts.push(`
Context:
${context}`);
        
        return parts.join('\n');
    }

    // Handle input field changes
    function handleInputChange() {
        updateCharCount();
        updateEnhanceButtonState();
        updateInputQualityScore();
    }

    // Handle output field changes
    function handleOutputChange() {
        const score = calculateQualityScore(promptOutput.value);
        updateQualityScoreDisplay(outputQualityScore, outputScoreFill, score);
        copyOutputBtn.disabled = promptOutput.value.trim().length === 0;
        
        // Enable/disable save button based on prompt availability and authentication
        if (savePromptBtn) {
            savePromptBtn.disabled = promptOutput.value.trim().length === 0 || !isAuthenticated;
        }
    }

    // Update character count
    function updateCharCount() {
        const fullText = getCombinedPrompt();
        const count = fullText.length;
        const maxLength = 5000;
        inputCharCount.textContent = count;

        // Update progress bar
        const charProgressFill = document.getElementById('char-progress-fill');
        if (charProgressFill) {
            const percentage = Math.min((count / maxLength) * 100, 100);
            charProgressFill.style.width = percentage + '%';

            // Reset classes
            charProgressFill.classList.remove('warning', 'error');

            // Warning state (80%+)
            if (percentage >= 80 && percentage < 95) {
                charProgressFill.classList.add('warning');
            }
            // Error state (95%+)
            else if (percentage >= 95) {
                charProgressFill.classList.add('error');
            }
        }

        // Change color based on character count
        if (count > 8000) {
            inputCharCount.style.color = 'var(--error)';
        } else if (count > 6000) {
            inputCharCount.style.color = 'var(--warning)';
        } else {
            inputCharCount.style.color = 'var(--text-muted)';
        }
    }

    // Update enhance button state
    function updateEnhanceButtonState() {
        const hasContent = promptInput.value.trim().length > 0;
        enhanceBtn.disabled = !hasContent || isProcessing;
    }

    // Handle prompt enhancement
    async function handleEnhancePrompt() {
        const originalPrompt = getCombinedPrompt();
        
        if (!promptInput.value.trim()) {
            showNotification('Please enter a core instruction to enhance.', 'error');
            return;
        }

        if (isProcessing) {
            return;
        }

        try {
            // Start processing
            isProcessing = true;
            setProcessingState(true);
            // Processing status is now handled by the spinner
            
            // Clear previous output
            promptOutput.value = '';
            copyOutputBtn.disabled = true;
            enhancementTime.textContent = '';

            // Measure enhancement time
            const startTime = performance.now();

            // Call UncloseAI Hermes model
            const result = await enhancePromptWithUncloseAI(originalPrompt);
            const enhancedPrompt = result.prompt;
            const feedback = result.feedback;

            // Calculate processing time
            const endTime = performance.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(1);

            // Display results
            promptOutput.value = enhancedPrompt;
            promptOutput.readOnly = false; // Make it editable
            copyOutputBtn.disabled = false;
            enhancementTime.textContent = `Enhanced in ${processingTime}s`;
            
            // Update feedback section
            if (feedback && feedbackBody) {
                renderFeedback(feedback);
                feedbackToggle.disabled = false;
                // Automatically open feedback if it's the first time or user preference (optional)
                // For now, we keep it closed by default as per design patterns
            } else {
                feedbackToggle.disabled = true;
                if (feedbackBody) feedbackBody.innerHTML = '';
            }

            // Calculate and display quality scores
            const inputScore = calculateQualityScore(originalPrompt);
            const outputScore = calculateQualityScore(enhancedPrompt);
            
            updateQualityScoreDisplay(inputQualityScore, inputScoreFill, inputScore);
            updateQualityScoreDisplay(outputQualityScore, outputScoreFill, outputScore);
            
            // Show improvement indicator
            showScoreImprovement(inputScore, outputScore);
             
             showNotification('Prompt enhanced successfully!', 'success');
             
            // Switch to output tab on mobile
            showEnhancedOutputTab();
             
            // Check if this prompt is already saved (for authenticated users)
            if (isAuthenticated) {
                checkIfPromptSaved();
            }
             
            // Scroll to output
            promptOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
             
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            showNotification(error.message || 'Failed to enhance prompt. Please try again.', 'error');
        } finally {
            // End processing
            isProcessing = false;
            setProcessingState(false);
            updateEnhanceButtonState();
        }
    }

    // Get mode from temperature value
    function getModeFromTemperature(temp) {
        if (temp <= temperatureRanges.precise.max) return 'precise';
        if (temp <= temperatureRanges.balanced.max) return 'balanced';
        if (temp <= temperatureRanges.creative.max) return 'creative';
        return 'max';
    }

    // Get mode-specific system prompt extension
    function getModeSystemPromptExtension(mode) {
        const extensions = {
            precise: `\n\nENHANCEMENT STYLE: PRECISE\n- Focus on clarity, conciseness, and precision\n- Make minimal changes - only what's necessary\n- Preserve the original structure and wording where possible\n- Eliminate ambiguity without adding unnecessary complexity\n- Prioritize directness and efficiency`,
            balanced: `\n\nENHANCEMENT STYLE: BALANCED\n- Improve clarity while maintaining the original intent\n- Add helpful context and structure without over-elaborating\n- Balance conciseness with comprehensiveness\n- Make moderate enhancements that respect the original prompt's tone`,
            creative: `\n\nENHANCEMENT STYLE: CREATIVE\n- Add relevant context, specifications, or requirements to improve LLM response quality\n- Use more precise terminology and clearer language\n- Add specific constraints or output format requirements if helpful\n- Enhance with examples, clarifications, or edge cases that improve results\n- Make the prompt more effective for getting high-quality LLM outputs\n- CRITICAL: Preserve the original prompt's core purpose and intent\n- CRITICAL: DO NOT add new concepts, topics, or assumptions not in the original\n- CRITICAL: Only add context/requirements that directly improve LLM performance\n- CRITICAL: Keep the same question/request structure\n- Focus on practical effectiveness, not artistic or flowery language`,
            max: `\n\nENHANCEMENT STYLE: MAXIMUM CREATIVITY\n- Maximize effectiveness for getting the best possible LLM response\n- Add comprehensive context, detailed specifications, and precise requirements\n- Include optimal formatting, structure, or output instructions\n- Add relevant examples, edge cases, or constraints that significantly improve results\n- Use the most effective prompt engineering techniques and best practices\n- CRITICAL: Preserve the original prompt's core purpose and intent\n- CRITICAL: DO NOT add new concepts, topics, or assumptions not in the original\n- CRITICAL: Only add context/requirements that directly improve LLM performance\n- CRITICAL: Keep the same question/request structure\n- Focus on practical effectiveness and results, not artistic language`
        };
        return extensions[mode] || extensions.balanced;
    }

    // Enhance prompt using UncloseAI
    async function enhancePromptWithUncloseAI(prompt) {
        console.log('Starting prompt enhancement for:', prompt);

        const currentMode = getModeFromTemperature(currentTemperature);
        console.log('Current enhancement mode:', currentMode);

        try {
            console.log('Sending request to UncloseAI API...');

            const baseSystemPrompt = `You are a prompt enhancement expert. Your task is to generate an enhanced version of the user's prompt AND provide feedback on what was improved.

You MUST respond with a valid JSON object in the following format:
{
  "enhanced_prompt": "The enhanced version of the prompt",
  "feedback": {
    "summary": "Brief overview of changes (1 sentence)",
    "improvements": [
      {
        "category": "clarity|specificity|structure|context|constraints|style",
        "text": "Specific improvement made"
      }
    ]
  }
}

RULES:
1. The "enhanced_prompt" must be the direct prompt text, ready to use.
2. The "feedback" object must contain a summary and list of specific improvements.
3. Provide 2-4 specific improvements.
4. NO conversational fillers or markdown formatting outside the JSON.`;

            const modeExtension = getModeSystemPromptExtension(currentMode);
            const systemPrompt = baseSystemPrompt + modeExtension;

            // Call UncloseAI Hermes API directly with correct format
            const response = await fetch('https://hermes.ai.unturf.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer dummy-api-key'
                },
                body: JSON.stringify({
                    model: 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: `Enhance this prompt and provide feedback:\n\n${prompt}`
                        }
                    ],
                    max_tokens: 500, // Increased to ensure full JSON fits
                    temperature: currentTemperature
                })
            });

            console.log('API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API request failed:', response.status, errorText);
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('API response data:', data);
            
            let fullResponse = data.choices?.[0]?.message?.content || '';

            if (!fullResponse || fullResponse.trim().length === 0) {
                console.error('Received empty response from AI');
                throw new Error('Received empty response from AI');
            }

            // Parse JSON response
            let enhancedText = '';
            let feedbackText = '';

            try {
                // Remove potential markdown code blocks if present
                const cleanJson = fullResponse.replace(/```json\n?|\n?```/g, '').trim();
                const parsedResponse = JSON.parse(cleanJson);
                
                enhancedText = parsedResponse.enhanced_prompt || '';
                feedbackText = parsedResponse.feedback || '';
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                
                // Attempt to extract using Regex if JSON parse fails (common with LLMs putting newlines in strings)
                // Regex matches: "enhanced_prompt": "..." handling escaped quotes
                const promptMatch = fullResponse.match(/"enhanced_prompt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                
                if (promptMatch && promptMatch[1]) {
                    console.log('Successfully extracted prompt using regex fallback');
                    enhancedText = promptMatch[1];
                    
                    // Unescape JSON string content manually since we didn't use JSON.parse
                    enhancedText = enhancedText
                        .replace(/\\n/g, '\n')
                        .replace(/\\r/g, '\r')
                        .replace(/\\t/g, '\t')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');
                        
                    // Try to extract feedback as well
                    // We look for "feedback": { ... }
                    // This is simple and might fail on nested braces, but covers most cases
                    const feedbackMatch = fullResponse.match(/"feedback"\s*:\s*(\{[\s\S]*?\})\s*$/) ||
                                          fullResponse.match(/"feedback"\s*:\s*(\{[\s\S]*?\})\s*\}/);
                                          
                    if (feedbackMatch && feedbackMatch[1]) {
                        try {
                            // Try to parse just the feedback object
                            // We might need to clean it too if it has issues
                            feedbackText = JSON.parse(feedbackMatch[1]);
                        } catch (fe) {
                            // If feedback parse fails, use default
                            console.warn('Failed to parse extracted feedback JSON', fe);
                        }
                    }
                    
                    // If we didn't get feedbackText from the above, use default
                    if (!feedbackText || typeof feedbackText !== 'object') {
                         feedbackText = {
                            summary: "The prompt was enhanced to provide more clarity and structure.",
                            improvements: [
                                { category: "general", text: "Improved overall structure and clarity" }
                            ]
                        };
                    }
                } else {
                    // Fallback: try to extract text if JSON parsing fails and regex fails
                    // This is a simple fallback that assumes the model might have just outputted text
                    enhancedText = fullResponse;
                    feedbackText = {
                        summary: "The prompt was enhanced to provide more clarity and structure.",
                        improvements: [
                            { category: "general", text: "Improved overall structure and clarity" }
                        ]
                    };
                }
            }

            // Clean up the prompt part
            enhancedText = enhancedText.trim();
            
            // Remove any common prefixes if present (just in case)
            enhancedText = enhancedText.replace(/^(Enhanced prompt:|Here's the enhanced prompt:|Improved prompt:|Here is the enhanced prompt:|The enhanced prompt is:)\s*/i, '');
            
            // Remove any conversational lead-ins
            enhancedText = enhancedText.replace(/^(Here is|Here's|The following is|This is the)\s+(enhanced\s+)?prompt\s*:?\s*/i, '');
            
            // Remove any quotes around the text (only if they wrap the entire text)
            if (enhancedText.startsWith('"') && enhancedText.endsWith('"')) {
                enhancedText = enhancedText.slice(1, -1);
            }
            
            console.log('Cleaned enhanced text:', enhancedText);
            
            if (enhancedText.length === 0) {
                throw new Error('Enhanced prompt is empty after cleaning');
            }
            
            console.log('Successfully enhanced prompt using Hermes API');
            
            return {
                prompt: enhancedText,
                feedback: feedbackText
            };

        } catch (error) {
            console.error('UncloseAI API error:', error);
            showNotification('Using fallback enhancement due to API issues', 'warning');
            
            // Fallback enhancement if API fails
            const fallbackResult = createFallbackEnhancement(prompt);
            return fallbackResult;
        }
    }

    // Create fallback enhancement (used when API is unavailable)
    function createFallbackEnhancement(originalPrompt) {
        // More intelligent fallback based on the original prompt content
        const promptType = detectPromptType(originalPrompt);
        
        let enhancement = originalPrompt;
        let feedback = {
            summary: "",
            improvements: []
        };
        
        switch(promptType) {
            case 'creative':
                enhancement += `\n\nPlease provide a creative and imaginative response with unique insights and original ideas. Use descriptive language and engaging storytelling techniques.`;
                feedback.summary = "Enhanced for creativity and engagement.";
                feedback.improvements = [
                    { category: "style", text: "Added directives for imagination and descriptive language" },
                    { category: "structure", text: "Requested unique insights and original ideas" }
                ];
                break;
            case 'technical':
                enhancement += `\n\nPlease provide a technically accurate and detailed explanation. Include relevant code examples, technical specifications, and step-by-step instructions where applicable.`;
                feedback.summary = "Enhanced for technical accuracy and detail.";
                feedback.improvements = [
                    { category: "specificity", text: "Added requirements for technical accuracy and specifications" },
                    { category: "structure", text: "Requested code examples and step-by-step instructions" }
                ];
                break;
            case 'explanatory':
                enhancement += `\n\nPlease provide a comprehensive explanation with clear structure. Use headings, bullet points, and examples to make the content easy to understand.`;
                feedback.summary = "Enhanced for clarity and comprehension.";
                feedback.improvements = [
                    { category: "structure", text: "Added requests for headings and bullet points" },
                    { category: "clarity", text: "Requested examples to improve understanding" }
                ];
                break;
            case 'instructional':
                enhancement += `\n\nPlease provide detailed, step-by-step instructions. Include prerequisites, common pitfalls, and best practices for successful implementation.`;
                feedback.summary = "Enhanced for actionable instruction.";
                feedback.improvements = [
                    { category: "structure", text: "Added step-by-step instruction requirements" },
                    { category: "context", text: "Included prerequisites and best practices" }
                ];
                break;
            default:
                enhancement += `\n\nPlease provide a detailed and comprehensive response that thoroughly addresses the topic. Include relevant examples, context, and practical applications.`;
                feedback.summary = "Enhanced for comprehensiveness.";
                feedback.improvements = [
                    { category: "detail", text: "Expanded request for detailed coverage" },
                    { category: "context", text: "Added requests for relevant examples and context" }
                ];
        }
        
        return {
            prompt: enhancement,
            feedback: feedback
        };
    }
    
    // Detect the type of prompt to provide better fallback enhancements
    function detectPromptType(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('create') || lowerPrompt.includes('write') || lowerPrompt.includes('design') || lowerPrompt.includes('story')) {
            return 'creative';
        }
        if (lowerPrompt.includes('code') || lowerPrompt.includes('program') || lowerPrompt.includes('technical') || lowerPrompt.includes('api')) {
            return 'technical';
        }
        if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is') || lowerPrompt.includes('how does') || lowerPrompt.includes('describe')) {
            return 'explanatory';
        }
        if (lowerPrompt.includes('how to') || lowerPrompt.includes('steps') || lowerPrompt.includes('tutorial') || lowerPrompt.includes('guide')) {
            return 'instructional';
        }
        
        return 'general';
    }

    // Copy text to clipboard
    async function copyToClipboard(text, source) {
        if (!text) {
            showNotification('Nothing to copy.', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            
            // Add visual feedback with animation class
            const button = source === 'input' ? copyInputBtn : copyOutputBtn;
            const originalContent = button.innerHTML;
            button.classList.add('copied');
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);

            showNotification('Text copied to clipboard!', 'success');
            
        } catch (error) {
            console.error('Failed to copy text:', error);
            
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                showNotification('Text copied to clipboard!', 'success');
            } catch (fallbackError) {
                showNotification('Failed to copy text. Please select and copy manually.', 'error');
            }
        }
    }

    // Set processing state
    function setProcessingState(processing) {
        const outputWrapper = document.querySelector('.output-panel .textarea-wrapper');
        
        if (processing) {
            enhanceBtn.disabled = true;
            btnText.style.display = 'none';
            loadingSpinner.style.display = 'block';
            promptInput.disabled = true;
            if(contextInput) contextInput.disabled = true;
            if(promptOutput) promptOutput.readOnly = true;
            
            // Disable save button during processing
            if (savePromptBtn) {
                savePromptBtn.disabled = true;
            }
            
            // Show skeleton loading
            if (outputWrapper && promptOutput) {
                promptOutput.style.display = 'none';
                const skeletonElement = document.createElement('div');
                skeletonElement.className = 'output-skeleton';
                skeletonElement.style.padding = '1.25rem';
                skeletonElement.innerHTML = `
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                `;
                outputWrapper.appendChild(skeletonElement);
            }
        } else {
            btnText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
            promptInput.disabled = false;
            if(contextInput) contextInput.disabled = false;
            
            // Re-enable save button if there's content and user is authenticated
            if (savePromptBtn && promptOutput && isAuthenticated) {
                savePromptBtn.disabled = promptOutput.value.trim().length === 0;
            }
            
            // Remove skeleton and show textarea
            if (outputWrapper && promptOutput) {
                const skeleton = outputWrapper.querySelector('.output-skeleton');
                if (skeleton) {
                    skeleton.remove();
                }
                promptOutput.style.display = 'block';
            }
        }
    }

    // Show notification message
    function showNotification(message, type = 'success') {
        // Announce to screen readers
        announce(message);

        // If we are currently animating a transition, queue new notification
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

    // Initialize notification container
    function initNotificationContainer() {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Internal function to display the notification
    function displayNotification(message, type) {
        isNotificationAnimating = true;

        // Get or create notification container
        const container = initNotificationContainer();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Create message container
        const messageContainer = document.createElement('span');
        messageContainer.textContent = message;
        messageContainer.style.flex = '1';
        messageContainer.style.paddingRight = '0.5rem';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;

        // Add close button click handler
        closeButton.addEventListener('click', () => {
            dismissNotification(notification);
        });

        // Create progress bar for auto-dismiss
        const progress = document.createElement('div');
        progress.className = 'notification-progress';
        progress.style.setProperty('--dismiss-duration', '3s');

        // Assemble the notification
        notification.appendChild(messageContainer);
        notification.appendChild(closeButton);
        notification.appendChild(progress);

        // Add to container instead of body
        container.appendChild(notification);
        activeNotification = notification;

        // Reset animation flag after slide-in (approx 300ms)
        setTimeout(() => {
            isNotificationAnimating = false;
            // If queue built up during slide-in, process it
            if (notificationQueue.length > 0) {
                dismissNotification(notification);
            }
        }, 350);

        // Auto-remove after 3 seconds
        const autoRemoveTimeout = setTimeout(() => {
            dismissNotification(notification);
        }, 3000);

        // Store timeout reference for cleanup
        notification.dataset.timeoutId = autoRemoveTimeout;
    }
    
    // Dismiss notification function
    function dismissNotification(notification) {
        if (!notification || notification.classList.contains('slide-out')) return;

        // Clear the auto-remove timeout
        if (notification.dataset.timeoutId) {
            clearTimeout(parseInt(notification.dataset.timeoutId));
        }

        isNotificationAnimating = true;
        notification.classList.add('slide-out');

        setTimeout(() => {
            // Get the notification container
            const container = document.querySelector('.notification-container');

            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }

            // Remove container if it's empty
            if (container && container.children.length === 0) {
                container.remove();
            }

            if (activeNotification === notification) {
                activeNotification = null;
            }

            isNotificationAnimating = false;

            // Process next notification in queue
            if (notificationQueue.length > 0) {
                const next = notificationQueue.shift();
                displayNotification(next.message, next.type);
            }
        }, 300);
    }

    // Announce status changes for screen readers
    function announce(message) {
        const announcer = document.getElementById('status-announcer');
        if (announcer) {
            announcer.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Quality Score Calculation Algorithm
    function calculateQualityScore(prompt) {
        if (!prompt || prompt.trim().length === 0) {
            return 0;
        }

        const text = prompt.trim();
        let score = 0;
        const maxScore = 100;

        // Base score for having content
        score += 10;

        // Length scoring (optimal range: 50-500 characters)
        const length = text.length;
        if (length >= 50 && length <= 500) {
            score += 20;
        } else if (length > 500 && length <= 1000) {
            score += 15;
        } else if (length > 1000) {
            score += 10;
        } else if (length >= 20) {
            score += 10;
        }

        // Clarity indicators
        const clarityIndicators = [
            'please', 'could you', 'would you', 'I need', 'I want', 'help me',
            'explain', 'describe', 'show me', 'tell me', 'provide', 'create'
        ];
        const clarityCount = clarityIndicators.filter(indicator =>
            text.toLowerCase().includes(indicator)
        ).length;
        score += Math.min(clarityCount * 5, 15);

        // Specificity indicators
        const specificityIndicators = [
            'specifically', 'exactly', 'precisely', 'detail', 'example',
            'step-by-step', 'format', 'structure', 'include', 'such as'
        ];
        const specificityCount = specificityIndicators.filter(indicator =>
            text.toLowerCase().includes(indicator)
        ).length;
        score += Math.min(specificityCount * 4, 12);

        // Context indicators
        const contextIndicators = [
            'background', 'context', 'purpose', 'goal', 'objective',
            'audience', 'scenario', 'situation', 'use case'
        ];
        const contextCount = contextIndicators.filter(indicator =>
            text.toLowerCase().includes(indicator)
        ).length;
        score += Math.min(contextCount * 3, 9);

        // Constraint indicators
        const constraintIndicators = [
            'limit', 'restrict', 'avoid', 'don\'t', 'not', 'within',
            'maximum', 'minimum', 'less than', 'more than', 'exactly'
        ];
        const constraintCount = constraintIndicators.filter(indicator =>
            text.toLowerCase().includes(indicator)
        ).length;
        score += Math.min(constraintCount * 3, 9);

        // Format indicators
        const formatIndicators = [
            'bullet', 'list', 'numbered', 'paragraph', 'table', 'json',
            'markdown', 'html', 'code', 'format', 'structure'
        ];
        const formatCount = formatIndicators.filter(indicator =>
            text.toLowerCase().includes(indicator)
        ).length;
        score += Math.min(formatCount * 4, 8);

        // Question marks (indicates specific requests)
        const questionMarks = (text.match(/\?/g) || []).length;
        score += Math.min(questionMarks * 2, 6);

        // Sentence structure (multiple sentences often indicate better structure)
        const sentences = text.split(/[.!?]+/)
        if (sentences.length >= 2) {
            score += 5;
        }
        if (sentences.length >= 3) {
            score += 3;
        }

        // Capitalization and punctuation
        const hasProperCapitalization = text[0] === text[0].toUpperCase();
        const hasProperPunctuation = /[.!?]$/.test(text);
        if (hasProperCapitalization) score += 2;
        if (hasProperPunctuation) score += 2;

        // Penalize for very short or very long prompts
        if (length < 20) score -= 10;
        if (length > 2000) score -= 5;

        return Math.min(Math.max(score, 0), maxScore);
    }

    // Update input quality score in real-time
    function updateInputQualityScore() {
        const prompt = getCombinedPrompt(); // Calculate score based on total content
        const score = calculateQualityScore(prompt);
        updateQualityScoreDisplay(inputQualityScore, inputScoreFill, score);
    }

    // Animated score counter function
    function animateScore(element, targetScore) {
        const duration = 600;
        const start = performance.now();
        const startValue = parseInt(element.textContent) || 0;
        
        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (targetScore - startValue) * eased);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Update quality score display
    function updateQualityScoreDisplay(scoreElement, fillElement, score) {
        const scoreValue = scoreElement.querySelector('.score-value');
        animateScore(scoreValue, Math.round(score));
        
        // Update fill bar
        fillElement.style.width = `${score}%`;
        
        // Remove existing score classes
        fillElement.classList.remove('low', 'medium', 'good', 'excellent');
        
        // Add appropriate score class
        if (score < 40) {
            fillElement.classList.add('low');
        } else if (score < 60) {
            fillElement.classList.add('medium');
        } else if (score < 80) {
            fillElement.classList.add('good');
        } else {
            fillElement.classList.add('excellent');
        }
    }

    // Show score improvement indicator
    function showScoreImprovement(inputScore, outputScore) {
        const improvement = outputScore - inputScore;
        
        if (improvement > 5) {
            outputQualityScore.classList.add('improved');
            
            // Create improvement indicator
            const indicator = document.createElement('div');
            indicator.className = 'score-improvement';
            indicator.textContent = `+${Math.round(improvement)}`;
            
            outputQualityScore.style.position = 'relative';
            outputQualityScore.appendChild(indicator);
            
            // Show the indicator with animation
            setTimeout(() => {
                indicator.classList.add('show');
            }, 100);
            
            // Remove after 3 seconds
            setTimeout(() => {
                indicator.classList.remove('show');
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                    outputQualityScore.classList.remove('improved');
                }, 300);
            }, 3000);
        }
    }

    // Handle session reset
    function handleResetSession() {
        if (isProcessing) {
            showNotification('Cannot reset while processing. Please wait.', 'error');
            return;
        }

        // Clear all input and output fields
        promptInput.value = '';
        if(contextInput) contextInput.value = '';
        promptOutput.value = '';
        promptOutput.readOnly = true;
        
        // Reset feedback
        if (feedbackBody) feedbackBody.innerHTML = '';
        if (feedbackToggle) {
            feedbackToggle.disabled = true;
            feedbackToggle.setAttribute('aria-expanded', 'false');
            feedbackContent.hidden = true;
        }

        // Reset UI states
        updateCharCount();
        updateEnhanceButtonState();
        updateInputQualityScore();
        
        // Reset quality score displays
        updateQualityScoreDisplay(inputQualityScore, inputScoreFill, 0);
        updateQualityScoreDisplay(outputQualityScore, outputScoreFill, 0);
        
        // Reset buttons
        copyOutputBtn.disabled = true;
        enhanceBtn.disabled = true;
        
        // Clear enhancement time
        enhancementTime.textContent = '';
        
        // Focus on input field for new entry
        promptInput.focus();
        
        showNotification('Session has been reset successfully.', 'success');
    }

    // Toggle feedback visibility
    function toggleFeedback() {
        const isExpanded = feedbackToggle.getAttribute('aria-expanded') === 'true';
        feedbackToggle.setAttribute('aria-expanded', !isExpanded);
        feedbackContent.hidden = isExpanded;
    }

    // Render structured feedback
    function renderFeedback(feedback) {
        if (!feedbackBody) return;
        
        // Handle legacy string feedback (backward compatibility)
        if (typeof feedback === 'string') {
            feedbackBody.innerHTML = `<p>${feedback}</p>`;
            return;
        }
        
        const summary = feedback.summary || "Here's how your prompt was improved:";
        const improvements = feedback.improvements || [];
        
        let html = `<div class="feedback-summary">${summary}</div>`;
        
        if (improvements.length > 0) {
            html += `<ul class="feedback-list">`;
            improvements.forEach(item => {
                const categoryName = item.category ? item.category : 'General';
                const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
                const categoryClass = `tag-${normalizedCategory}`;
                
                html += `
                    <li class="feedback-item">
                        <span class="feedback-tag ${categoryClass}">${categoryName}</span>
                        <span class="feedback-text">${item.text}</span>
                    </li>
                `;
            });
            html += `</ul>`;
        }
        
        feedbackBody.innerHTML = html;
    }

    // Load prompt from library if available
    function loadPromptFromLibrary() {
        const selectedPrompt = localStorage.getItem('selectedPrompt');
        if (selectedPrompt) {
            promptInput.value = selectedPrompt;
            localStorage.removeItem('selectedPrompt'); // Clear after loading
            updateCharCount();
            updateEnhanceButtonState();
            updateInputQualityScore();
            showNotification('Prompt loaded from library!', 'success');
            
            // Focus on the input field
            promptInput.focus();
        }
    }

    // Theme Management
    function initTheme() {
        // Get the theme that was applied by the inline script
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        
        // Ensure icons are in sync with the current theme
        updateThemeIcons(currentTheme);
        
        // Listen for system theme changes if no user preference is set
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

        // Add transitioning class to disable transitions temporarily
        document.documentElement.classList.add('theme-transitioning');

        // Apply theme
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // Re-enable transitions after a brief delay
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 50);

        showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info');
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcons(theme);
    }
    
function updateThemeIcons(theme) {
        // Update theme toggle icons
        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
        
        // Update logo based on theme
        updateThemeLogo(theme);
    }

    function updateThemeLogo(theme) {
        const logoImg = document.getElementById('theme-logo');
        if (!logoImg) return;
        

        
        // Change logo source
        const newSrc = theme === 'dark' 
            ? 'assets/images/logo-dark-baclground.webp'
            : 'assets/images/logo-light-background.webp';
        
        // Preload new image to prevent flicker
        const tempImg = new Image();
        tempImg.onload = function() {
logoImg.src = newSrc;
        };
        tempImg.src = newSrc;
    }

    // Authentication System
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userDisplay = document.getElementById('user-display');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Sidebar auth elements
    const sidebarAuthSection = document.getElementById('sidebar-auth-section');
    const sidebarLoginBtn = document.getElementById('sidebar-login-btn');
    const sidebarRegisterBtn = document.getElementById('sidebar-register-btn');
    const sidebarUserSection = document.getElementById('sidebar-user-section');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
    const sidebarLogoutSection = document.getElementById('sidebar-logout-section');

    // Modal elements
    const authModalOverlay = document.getElementById('auth-modal-overlay');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeLoginModal = document.getElementById('close-login-modal');
    const closeRegisterModal = document.getElementById('close-register-modal');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Authentication state
    let isAuthenticated = false;
    let currentUser = null;
    
    // Check authentication status on page load
    async function checkAuthStatus() {
        try {
            const response = await fetch('api/auth-check.php');
            const data = await response.json();
            
            if (response.ok && data.authenticated) {
                isAuthenticated = true;
                currentUser = data.user;
                showUserMenu();
                updateUserDisplay();
                updateSidebarAuthState();
            } else {
                isAuthenticated = false;
                currentUser = null;
                showAuthButtons();
                updateSidebarAuthState();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            isAuthenticated = false;
            currentUser = null;
            showAuthButtons();
            updateSidebarAuthState();
        }
    }
    
    // Show authentication buttons (logged out state)
    function showAuthButtons() {
        // Remove inline styles to let CSS media queries control visibility
        authButtons.style.removeProperty('display');
        userMenu.style.display = 'none';
        updateSidebarAuthState();
    }

    // Show user menu (logged in state)
    function showUserMenu() {
        if (currentUser) {
            userDisplay.textContent = currentUser.username;
            if (sidebarUserName) {
                sidebarUserName.textContent = currentUser.username;
            }
            authButtons.style.display = 'none';
            userMenu.style.removeProperty('display');
        }
    }
    
    // Update sidebar auth state - show/hide "My Account" section and auth buttons
    function updateSidebarAuthState() {
        if (sidebarMyAccount) {
            if (isAuthenticated) {
                sidebarMyAccount.style.display = 'block';
            } else {
                sidebarMyAccount.style.display = 'none';
            }
        }

        // Update sidebar auth sections using classes (more reliable than inline styles)
        if (sidebarAuthSection && sidebarUserSection && sidebarLogoutSection) {
            if (isAuthenticated) {
                // User is logged in - show user section & logout, hide login/register
                sidebarAuthSection.classList.remove('logged-out');
                sidebarAuthSection.classList.add('logged-in');
                sidebarUserSection.classList.remove('logged-out');
                sidebarUserSection.classList.add('logged-in');
                sidebarLogoutSection.classList.remove('logged-out');
                sidebarLogoutSection.classList.add('logged-in');
            } else {
                // User is logged out - show login/register, hide user section & logout
                sidebarAuthSection.classList.remove('logged-in');
                sidebarAuthSection.classList.add('logged-out');
                sidebarUserSection.classList.remove('logged-in');
                sidebarUserSection.classList.add('logged-out');
                sidebarLogoutSection.classList.remove('logged-in');
                sidebarLogoutSection.classList.add('logged-out');
            }
        }
    }
    
    // Override showUserMenu to check for profile button (already styled via user-menu-toggle class)
    // The profile button shows icon + username via HTML structure, so we just need to set username text
    function updateUserDisplay() {
        if (currentUser) {
            if (userDisplay) {
                userDisplay.textContent = currentUser.username;
            }
            if (sidebarUserName) {
                sidebarUserName.textContent = currentUser.username;
            }
        }
    }

// Open modal
    function openModal(modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Create and activate focus trap
        const focusTrap = new FocusTrap(modal);
        focusTrap.activate();

        // Store reference for cleanup
        modal.dataset.focusTrap = JSON.stringify({ active: true });

        // Show auth overlay for auth modals
        if (modal === loginModal || modal === registerModal) {
            modal.style.display = 'block';
            authModalOverlay.style.display = 'block';
        }

        // Setup password toggles for this modal
        setTimeout(() => {
            const modalToggleButtons = modal.querySelectorAll('.password-toggle-btn');
            modalToggleButtons.forEach(button => {
                // Remove existing listeners to prevent duplicates
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', function() {
                    togglePasswordVisibility(this);
                });
                
                newButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        togglePasswordVisibility(this);
                    }
                });
            });
        }, 50);
    }
    
    // Close modal
    function closeModal(modalElement) {
        // Deactivate focus trap before closing
        const allModals = document.querySelectorAll('.modal-backdrop.open, .modal-overlay.open');
        allModals.forEach(modal => {
            if (modal.dataset.focusTrap) {
                try {
                    const focusTrapData = JSON.parse(modal.dataset.focusTrap);
                    if (focusTrapData.active) {
                        const focusableElements = modal.querySelectorAll(
                            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                        );
                        focusableElements.forEach(el => el.removeEventListener('keydown', null));
                    }
                } catch (e) {
                    // Cleanup even if parsing fails
                }
            }
        });

        // If no parameter, close all auth modals (backward compatibility)
        if (!modalElement) {
            // Add closing class for exit animation
            loginModal.classList.add('closing');
            registerModal.classList.add('closing');

            // Wait for animation to complete before hiding
            setTimeout(() => {
                authModalOverlay.style.display = 'none';
                loginModal.style.display = 'none';
                loginModal.classList.remove('open', 'closing');
                registerModal.style.display = 'none';
                registerModal.classList.remove('open', 'closing');

                // Clear form errors
                clearFormErrors(loginForm);
                clearFormErrors(registerForm);
            }, 200);
        } else {
            // Add closing class for exit animation
            modalElement.classList.add('closing');

            // Wait for animation to complete before hiding
            setTimeout(() => {
                // Remove open and closing classes from modal
                modalElement.classList.remove('open', 'closing');

                // Hide auth overlay if closing an auth modal
                if (modalElement === loginModal || modalElement === registerModal) {
                    modalElement.style.display = 'none';
                    authModalOverlay.style.display = 'none';

                    // Clear form errors
                    clearFormErrors(loginForm);
                    clearFormErrors(registerForm);
                }

                // Hide other modals (profile, delete-confirm)
                if (modalElement === profileModal || modalElement === deleteConfirmModal) {
                    modalElement.setAttribute('aria-hidden', 'true');
                }
            }, 200);
        }

        document.body.style.overflow = '';
    }
    
    // Clear form errors
    function clearFormErrors(form) {
        if (form) {
            const errorElements = form.querySelectorAll('.error-message');
            errorElements.forEach(el => el.remove());
        }
    }
    
    // Show form error
    function showFormError(form, message) {
        clearFormErrors(form);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.marginTop = '8px';
        errorDiv.style.fontSize = '14px';
        errorDiv.textContent = message;
        form.appendChild(errorDiv);
    }
    
    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            showFormError(loginForm, 'Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                isAuthenticated = true;
                currentUser = data.user;
                closeModal();
                showUserMenu();
                updateSidebarAuthState();
                showNotification('Login successful!', 'success');
            } else {
                showFormError(loginForm, data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showFormError(loginForm, 'Network error. Please try again.');
        }
    }
    
    // Handle registration form submission
    async function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        
        if (!username || !email || !password) {
            showFormError(registerForm, 'Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Registration successful! Please login.', 'success');
                // Switch to login form after successful registration
                setTimeout(() => {
                    closeModal();
                    openModal(loginModal);
                    // Pre-fill username/email if needed
                    document.getElementById('login-username').value = username;
                }, 1500);
            } else {
                showFormError(registerForm, data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showFormError(registerForm, 'Network error. Please try again.');
        }
    }
    
    // Handle logout
    async function handleLogout() {
        try {
            const response = await fetch('api/logout.php', {
                method: 'POST'
            });

            if (response.ok) {
                isAuthenticated = false;
                currentUser = null;
                showAuthButtons();
                updateSidebarAuthState();
                // Close mobile sidebar if open
                if (sidebar && sidebar.classList.contains('open')) {
                    closeMobileMenu();
                }
                showNotification('Logged out successfully', 'info');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if server fails
            isAuthenticated = false;
            currentUser = null;
            showAuthButtons();
            updateSidebarAuthState();
            // Close mobile sidebar if open
            if (sidebar && sidebar.classList.contains('open')) {
                closeMobileMenu();
            }
        }
    }
    
    // Setup authentication event listeners
    function setupAuthEventListeners() {
        // Modal opening - header buttons
        if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
        if (registerBtn) registerBtn.addEventListener('click', () => openModal(registerModal));

        // Modal opening - sidebar buttons
        if (sidebarLoginBtn) sidebarLoginBtn.addEventListener('click', () => {
            // Show overlay immediately to block page interactions
            if (authModalOverlay) authModalOverlay.style.display = 'block';
            // Close sidebar
            closeMobileMenu();
            // Wait for sidebar animation to complete (300ms), then show modal
            setTimeout(() => {
                loginModal.style.display = 'block';
                loginModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }, 300);
        });
        if (sidebarRegisterBtn) sidebarRegisterBtn.addEventListener('click', () => {
            // Show overlay immediately to block page interactions
            if (authModalOverlay) authModalOverlay.style.display = 'block';
            // Close sidebar
            closeMobileMenu();
            // Wait for sidebar animation to complete (300ms), then show modal
            setTimeout(() => {
                registerModal.style.display = 'block';
                registerModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }, 300);
        });

        // Modal closing
        if (closeLoginModal) closeLoginModal.addEventListener('click', () => closeModal(loginModal));
        if (closeRegisterModal) closeRegisterModal.addEventListener('click', () => closeModal(registerModal));
        if (authModalOverlay) authModalOverlay.addEventListener('click', closeModal);

        // Form switching
        if (switchToRegister) switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
            openModal(registerModal);
        });
        if (switchToLogin) switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
            openModal(loginModal);
        });

        // Form submissions
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (registerForm) registerForm.addEventListener('submit', handleRegister);

        // Logout
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', () => {
            handleLogout();
            // Close sidebar after logout
            closeMobileMenu();
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Check all modals
                if (loginModal.classList.contains('open') || registerModal.classList.contains('open')) {
                    closeModal();
                } else if (profileModal && profileModal.classList.contains('open')) {
                    closeModal(profileModal);
                } else if (deleteConfirmModal && deleteConfirmModal.classList.contains('open')) {
                    closeModal(deleteConfirmModal);
                }
            }
        });
    }
    
// Password visibility toggle functionality
    function setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle-btn');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                togglePasswordVisibility(this);
            });
            
            // Add keyboard support
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePasswordVisibility(this);
                }
            });
        });
    }
    
    function togglePasswordVisibility(toggleButton) {
        const passwordInput = toggleButton.previousElementSibling;
        const openEye = toggleButton.querySelector('.eye-icon.open');
        const closedEye = toggleButton.querySelector('.eye-icon.closed');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            openEye.style.display = 'block';
            closedEye.style.display = 'none';
            toggleButton.setAttribute('aria-label', 'Hide password');
        } else {
            passwordInput.type = 'password';
            openEye.style.display = 'none';
            closedEye.style.display = 'block';
            toggleButton.setAttribute('aria-label', 'Show password');
        }
    }

    // Initialize authentication system
    async function initAuth() {
        await checkAuthStatus();
        setupAuthEventListeners();
        setupPasswordToggles();
    }
    
    // Document ready function
    document.addEventListener('DOMContentLoaded', function() {
        initAuth();
        setupSavedPromptsAndProfileEventListeners();
        setupPasswordToggles(); // Also setup for any password fields on initial load
    });
    
    // Initialize saved prompts and profile event listeners
    function setupSavedPromptsAndProfileEventListeners() {
        console.log('Setting up saved prompts and profile event listeners...');
        
        // Debug: Check if elements exist
        console.log('viewProfileLink:', viewProfileLink);
        
        // Save prompt button
        if (savePromptBtn) {
            savePromptBtn.addEventListener('click', savePrompt);
            console.log('Attached listener to savePromptBtn');
        }
        
        // Profile button (replaces simple username display)
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                loadProfile();
                openModal(profileModal);
            });
            console.log('Attached listener to profileBtn');
        }

        // View profile link
        if (viewProfileLink) {
            console.log('Attaching listener to viewProfileLink');
            viewProfileLink.addEventListener('click', (e) => {
                console.log('viewProfileLink clicked!');
                e.preventDefault();
                e.stopPropagation();
                loadProfile();
                openModal(profileModal);
            });
        } else {
            console.error('viewProfileLink NOT FOUND!');
        }

        // Profile modal close
        if (closeProfileModalBtn) {
            closeProfileModalBtn.addEventListener('click', () => {
                closeModal(profileModal);
            });
        }
        
        // Click outside to close profile modal
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) {
                    closeModal(profileModal);
                }
            });
        }
        
        // Delete account modal open
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                openModal(deleteConfirmModal);
            });
        }
        
        // Delete confirmation modal close
        if (closeDeleteModalBtn) {
            closeDeleteModalBtn.addEventListener('click', () => {
                closeModal(deleteConfirmModal);
            });
        }
        
        // Click outside to close delete confirmation modal
        if (deleteConfirmModal) {
            deleteConfirmModal.addEventListener('click', (e) => {
                if (e.target === deleteConfirmModal) {
                    closeModal(deleteConfirmModal);
                }
            });
        }
        
        // Cancel delete button
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                closeModal(deleteConfirmModal);
            });
        }
        
        // Password form submit
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordChange);
        }
        
        // Delete account form submit
        if (deleteAccountForm) {
            deleteAccountForm.addEventListener('submit', handleDeleteAccount);
        }
    }
    
    // Save current enhanced prompt
    async function savePrompt() {
        const originalPrompt = getCombinedPrompt();
        const enhancedPrompt = promptOutput.value.trim();
        
        if (!enhancedPrompt) {
            showNotification('No enhanced prompt to save', 'error');
            return;
        }
        
        try {
            const response = await fetch('api/save-prompt.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_prompt: originalPrompt,
                    enhanced_prompt: enhancedPrompt
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Prompt saved successfully!', 'success');
                updateSaveButtonState(true);
            } else {
                showNotification(data.error || 'Failed to save prompt', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            showNotification('Failed to save prompt', 'error');
        }
    }

    // Update save button visual state
    function updateSaveButtonState(isSaved) {
        if (!savePromptBtn) return;
        
        if (isSaved) {
            savePromptBtn.classList.add('saved');
            savePromptBtn.title = 'Already saved';
        } else {
            savePromptBtn.classList.remove('saved');
            savePromptBtn.title = 'Save this prompt';
        }
    }
    
    // Check if current enhanced prompt is already saved
    async function checkIfPromptSaved() {
        const enhancedPrompt = promptOutput.value.trim();
        if (!enhancedPrompt || !isAuthenticated) {
            updateSaveButtonState(false);
            return;
        }
        
        try {
            const response = await fetch('api/check-prompt-saved.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enhanced_prompt: enhancedPrompt })
            });
            
            const data = await response.json();
            
            if (response.ok && data.saved) {
                updateSaveButtonState(true);
            } else {
                updateSaveButtonState(false);
            }
        } catch (error) {
            console.error('Check saved error:', error);
            updateSaveButtonState(false);
        }
    }
    
    // Load and display user profile
    async function loadProfile() {
        console.log('Loading profile...');
        try {
            const response = await fetch('api/get-profile.php');
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('profile-username').value = data.username;
                document.getElementById('profile-email').value = data.email;
                document.getElementById('profile-created').value = new Date(data.created_at).toLocaleDateString();
                document.getElementById('profile-saved-count').value = `${data.saved_prompts_count} / 100`;
            } else {
                showNotification('Failed to load profile', 'error');
            }
        } catch (error) {
            console.error('Profile load error:', error);
            showNotification('Failed to load profile', 'error');
        }
    }
    
    // Handle password change
    async function handlePasswordChange(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        
        if (!currentPassword || !newPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (newPassword === currentPassword) {
            showNotification('New password must be different from current password', 'error');
            return;
        }
        
        try {
            const response = await fetch('api/change-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Password changed successfully!', 'success');
                document.getElementById('password-form').reset();
            } else {
                showNotification(data.error || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Password change error:', error);
            showNotification('Failed to change password', 'error');
        }
    }
    
    // Handle account deletion
    async function handleDeleteAccount(e) {
        e.preventDefault();
        
        const password = document.getElementById('delete-password').value;
        
        if (!password) {
            showNotification('Please enter your password', 'error');
            return;
        }
        
        if (!confirm('This action cannot be undone. Are you absolutely sure?')) {
            return;
        }
        
        try {
            const response = await fetch('api/delete-account.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Account deleted successfully', 'success');
                closeModal(deleteConfirmModal);
                closeModal(profileModal);
                
                // Redirect to home after logout
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showNotification(data.error || 'Failed to delete account', 'error');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            showNotification('Failed to delete account', 'error');
        }
    }
    
    // Format date for display
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
    
    // Initialize application
    async function init() {
        initTheme();
        initTemperatureControl();
        initMobileTabs(); // Initialize mobile tab navigation
        setupEventListeners();
        checkUncloseAIAvailability();
        updateEnhanceButtonState();
        loadPromptFromLibrary();
        
        // Setup saved prompts and profile event listeners BEFORE auth
        setupSavedPromptsAndProfileEventListeners();
        
        await initAuth(); // Initialize authentication
        
        // Check if current enhanced prompt is already saved (for authenticated users)
        if (isAuthenticated) {
            checkIfPromptSaved();
        }
    }
    
    // Override the existing init call to be async
    init();
});

