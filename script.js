document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const promptInput = document.getElementById('prompt-input');
    const promptOutput = document.getElementById('prompt-output');
    const enhanceBtn = document.getElementById('enhance-btn');
    const resetBtn = document.getElementById('reset-btn');
    const copyInputBtn = document.getElementById('copy-input-btn');
    const copyOutputBtn = document.getElementById('copy-output-btn');
    const statusMessage = document.getElementById('status-message');
    const inputCharCount = document.getElementById('input-char-count');
    const enhancementTime = document.getElementById('enhancement-time');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');
    const inputQualityScore = document.getElementById('input-quality-score');
    const outputQualityScore = document.getElementById('output-quality-score');
    const inputScoreFill = document.getElementById('input-score-fill');
    const outputScoreFill = document.getElementById('output-score-fill');

    // State management
    let isProcessing = false;

    // Initialize the application
    function init() {
        setupEventListeners();
        checkUncloseAIAvailability();
        updateEnhanceButtonState();
        loadPromptFromLibrary();
    }

    // Check if UncloseAI library is loaded
    function checkUncloseAIAvailability() {
        // We'll use direct API calls to UncloseAI endpoints
        console.log('UncloseAI API integration ready');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Input field events
        promptInput.addEventListener('input', handleInputChange);
        promptInput.addEventListener('paste', () => {
            setTimeout(updateEnhanceButtonState, 10);
        });

        // Button events
        enhanceBtn.addEventListener('click', handleEnhancePrompt);
        resetBtn.addEventListener('click', handleResetSession);
        copyInputBtn.addEventListener('click', () => copyToClipboard(promptInput.value, 'input'));
        copyOutputBtn.addEventListener('click', () => copyToClipboard(promptOutput.value, 'output'));
        
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
                promptOutput.blur();
            }
        });
    }

    // Handle input field changes
    function handleInputChange() {
        updateCharCount();
        updateEnhanceButtonState();
        updateInputQualityScore();
        clearStatus();
    }

    // Update character count
    function updateCharCount() {
        const count = promptInput.value.length;
        inputCharCount.textContent = count;
        
        // Change color based on character count
        if (count > 4500) {
            inputCharCount.style.color = 'var(--error)';
        } else if (count > 4000) {
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
        const originalPrompt = promptInput.value.trim();
        
        if (!originalPrompt) {
            showError('Please enter a prompt to enhance.');
            return;
        }

        if (isProcessing) {
            return;
        }

        try {
            // Start processing
            isProcessing = true;
            setProcessingState(true);
            showStatus('Enhancing your prompt...', 'processing');
            
            // Clear previous output
            promptOutput.value = '';
            copyOutputBtn.disabled = true;
            enhancementTime.textContent = '';

            // Measure enhancement time
            const startTime = performance.now();

            // Call UncloseAI Hermes model
            const enhancedPrompt = await enhancePromptWithUncloseAI(originalPrompt);

            // Calculate processing time
            const endTime = performance.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(1);

            // Display results
            promptOutput.value = enhancedPrompt;
            copyOutputBtn.disabled = false;
            enhancementTime.textContent = `Enhanced in ${processingTime}s`;
            
            // Calculate and display quality scores
            const inputScore = calculateQualityScore(originalPrompt);
            const outputScore = calculateQualityScore(enhancedPrompt);
            
            updateQualityScoreDisplay(inputQualityScore, inputScoreFill, inputScore);
            updateQualityScoreDisplay(outputQualityScore, outputScoreFill, outputScore);
            
            // Show improvement indicator
            showScoreImprovement(inputScore, outputScore);
            
            showSuccess('Prompt enhanced successfully!');
            
            // Scroll to output
            promptOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            showError(error.message || 'Failed to enhance prompt. Please try again.');
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
            // Create the enhancement prompt using the specified system prompt format
            const enhancementPrompt = `Generate an enhanced version of this prompt (reply with only the enhanced prompt - no conversation, explanations, lead-in, bullet points, placeholders, or surrounding quotes):

${prompt}`;

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
                            content: 'You are a prompt enhancement expert. Your task is to generate an enhanced version of the user\'s prompt. CRITICAL RULES: 1) Reply with ONLY the enhanced prompt text 2) NEVER include phrases like "Here is the enhanced prompt", "The enhanced prompt is", "Here\'s", or any similar introductions 3) NO explanations, conversations, or meta-commentary 4) NO bullet points or numbered lists 5) NO surrounding quotes 6) Start immediately with the enhanced prompt content'
                        },
                        {
                            role: 'user',
                            content: `Generate an enhanced version of this prompt (reply with only the enhanced prompt - no conversation, explanations, lead-in, bullet points, placeholders, or surrounding quotes):\n\n${prompt}`
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.3
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
            
            let enhancedText = data.choices?.[0]?.message?.content || '';

            if (!enhancedText || enhancedText.trim().length === 0) {
                console.error('Received empty response from AI');
                throw new Error('Received empty response from AI');
            }

            // Clean up the response
            enhancedText = enhancedText.trim();
            
            // Remove any common prefixes if present (more comprehensive list)
            enhancedText = enhancedText.replace(/^(Enhanced prompt:|Here's the enhanced prompt:|Improved prompt:|Here is the enhanced prompt:|The enhanced prompt is:)\s*/i, '');
            
            // Remove any conversational lead-ins
            enhancedText = enhancedText.replace(/^(Here is|Here's|The following is|This is the)\s+(enhanced\s+)?prompt\s*:?\s*/i, '');
            
            // Remove any quotes around the text
            enhancedText = enhancedText.replace(/^["']|["']$/g, '');
            
            console.log('Cleaned enhanced text:', enhancedText);
            
            if (enhancedText.length === 0) {
                throw new Error('Enhanced prompt is empty after cleaning');
            }
            
            console.log('Successfully enhanced prompt using Hermes API');
            return enhancedText;

        } catch (error) {
            console.error('UncloseAI API error:', error);
            showWarning('Using fallback enhancement due to API issues');
            
            // Fallback enhancement if API fails
            const fallbackEnhancement = createFallbackEnhancement(prompt);
            return fallbackEnhancement;
        }
    }

    // Create fallback enhancement (used when API is unavailable)
    function createFallbackEnhancement(originalPrompt) {
        // More intelligent fallback based on the original prompt content
        const promptType = detectPromptType(originalPrompt);
        
        let enhancement = originalPrompt;
        
        switch(promptType) {
            case 'creative':
                enhancement += `\n\nPlease provide a creative and imaginative response with unique insights and original ideas. Use descriptive language and engaging storytelling techniques.`;
                break;
            case 'technical':
                enhancement += `\n\nPlease provide a technically accurate and detailed explanation. Include relevant code examples, technical specifications, and step-by-step instructions where applicable.`;
                break;
            case 'explanatory':
                enhancement += `\n\nPlease provide a comprehensive explanation with clear structure. Use headings, bullet points, and examples to make the content easy to understand.`;
                break;
            case 'instructional':
                enhancement += `\n\nPlease provide detailed, step-by-step instructions. Include prerequisites, common pitfalls, and best practices for successful implementation.`;
                break;
            default:
                enhancement += `\n\nPlease provide a detailed and comprehensive response that thoroughly addresses the topic. Include relevant examples, context, and practical applications.`;
        }
        
        return enhancement;
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
    
    // Show warning message
    function showWarning(message) {
        showStatus(message, 'warning');
        setTimeout(clearStatus, 4000);
    }

    // Copy text to clipboard
    async function copyToClipboard(text, source) {
        if (!text) {
            showError('Nothing to copy.');
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

            showSuccess('Text copied to clipboard!');
            
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
                
                showSuccess('Text copied to clipboard!');
            } catch (fallbackError) {
                showError('Failed to copy text. Please select and copy manually.');
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
        } else {
            btnText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
            promptInput.disabled = false;
        }
    }

    // Status message functions
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
    }

    function showSuccess(message) {
        showStatus(message, 'success');
        setTimeout(clearStatus, 3000);
    }

    function showError(message) {
        showStatus(message, 'error');
        setTimeout(clearStatus, 5000);
    }

    function clearStatus() {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
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
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
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
        const prompt = promptInput.value.trim();
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
            showError('Cannot reset while processing. Please wait.');
            return;
        }

        // Clear all input and output fields
        promptInput.value = '';
        promptOutput.value = '';
        
        // Reset UI states
        clearStatus();
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
        
        showSuccess('Session has been reset successfully.');
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
            showSuccess('Prompt loaded from library!');
            
            // Focus on the input field
            promptInput.focus();
        }
    }

    // Initialize the application
    init();
});