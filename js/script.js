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

    // State management
    let isProcessing = false;
    let currentTemperature = 0.3;

    // Notification system state
    let activeNotification = null;
    let notificationQueue = [];
    let isNotificationAnimating = false;

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
            temperatureFill.style.width = sliderValue + '%';
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
    }

    // Update character count
    function updateCharCount() {
        const fullText = getCombinedPrompt();
        const count = fullText.length;
        inputCharCount.textContent = count;
        
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

    // Enhance prompt using UncloseAI
    async function enhancePromptWithUncloseAI(prompt) {
        console.log('Starting prompt enhancement for:', prompt);
        
        try {
            console.log('Sending request to UncloseAI API...');
            
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
                            content: `You are a prompt enhancement expert. Your task is to generate an enhanced version of the user's prompt AND provide feedback on what was improved.

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
4. NO conversational fillers or markdown formatting outside the JSON.`
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
                // Fallback: try to extract text if JSON parsing fails
                // This is a simple fallback that assumes the model might have just outputted text
                enhancedText = fullResponse;
                feedbackText = {
                    summary: "The prompt was enhanced to provide more clarity and structure.",
                    improvements: [
                        { category: "general", text: "Improved overall structure and clarity" }
                    ]
                };
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
            
            // Add visual feedback
            const button = source === 'input' ? copyInputBtn : copyOutputBtn;
            const originalContent = button.innerHTML;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            button.classList.add('copy-feedback');
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copy-feedback');
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
        if (processing) {
            enhanceBtn.disabled = true;
            btnText.style.display = 'none';
            loadingSpinner.style.display = 'block';
            promptInput.disabled = true;
            if(contextInput) contextInput.disabled = true;
            if(promptOutput) promptOutput.readOnly = true;
        } else {
            btnText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
            promptInput.disabled = false;
            if(contextInput) contextInput.disabled = false;
        }
    }

    // Show notification message
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
        
        // Assemble the notification
        notification.appendChild(messageContainer);
        notification.appendChild(closeButton);
        
        document.body.appendChild(notification);
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
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
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

    // Update quality score display
    function updateQualityScoreDisplay(scoreElement, fillElement, score) {
        const scoreValue = scoreElement.querySelector('.score-value');
        scoreValue.textContent = Math.round(score);
        
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
        
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info');
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcons(theme);
    }
    
    function updateThemeIcons(theme) {
        // Update icons
        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    // Initialize the application
    init();
});
