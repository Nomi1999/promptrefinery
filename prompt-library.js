document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const promptsGrid = document.getElementById('prompts-grid');

    // Prompt templates data
    const promptTemplates = [
        {
            id: 1,
            category: 'creative',
            title: 'Story Character Development',
            description: 'Create detailed and compelling characters for your stories with depth and personality.',
            content: `Create a detailed character profile for a [role/archetype] in a [genre/setting] story, including:

1. Basic Information (name, age, appearance)
2. Background and history
3. Personality traits and quirks
4. Motivations and goals
5. Fears and weaknesses
6. Relationships with other characters
7. Character arc and development throughout the story

Please make the character feel real and three-dimensional with both strengths and flaws.`
        },
        {
            id: 2,
            category: 'creative',
            title: 'Creative Writing World Building',
            description: 'Develop immersive and detailed fictional worlds for your stories.',
            content: `Help me create a detailed fictional world for a [genre] story set in [time period/setting] by providing:

1. World name and basic concept
2. Geography and climate
3. History and major events
4. Cultures and societies
5. Magic system or technology level
6. Political systems and conflicts
7. Daily life and customs
8. Unique elements that make this world interesting

Focus on creating a cohesive and immersive setting that readers can easily visualize and believe in.`
        },
        {
            id: 3,
            category: 'business',
            title: 'Business Plan Outline',
            description: 'Create a comprehensive business plan structure for your startup idea.',
            content: `Generate a comprehensive business plan outline for a [business type/industry] startup that includes:

1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization and Management Structure
5. Products or Services Offered
6. Marketing and Sales Strategy
7. Financial Projections
8. Funding Requirements
9. Implementation Timeline
10. Risk Assessment and Mitigation Strategies

Please provide specific, actionable guidance for each section that can be customized for any business type.`
        },
        {
            id: 4,
            category: 'business',
            title: 'Marketing Campaign Strategy',
            description: 'Develop an effective marketing campaign strategy for your product or service.',
            content: `Create a detailed marketing campaign strategy for [product/service name] targeting [target audience] that includes:

1. Campaign objectives and KPIs
2. Target audience analysis and personas
3. Core messaging and value proposition
4. Channel selection and media mix
5. Content strategy and creative concepts
6. Budget allocation and timeline
7. Measurement and analytics plan
8. Contingency planning

Focus on creating an integrated campaign that reaches the right audience with the right message at the right time.`
        },
        {
            id: 5,
            category: 'technical',
            title: 'Code Documentation Template',
            description: 'Generate comprehensive documentation for your code projects.',
            content: `Create comprehensive code documentation for [project name/module] written in [programming language] that includes:

1. Project overview and purpose
2. Installation and setup instructions
3. API documentation with examples
4. Code architecture and design patterns
5. Configuration options
6. Troubleshooting guide
7. Contributing guidelines
8. Version history and changelog

Include code examples, use cases, and best practices to make the documentation clear and helpful for other developers.`
        },
        {
            id: 6,
            category: 'technical',
            title: 'Technical Problem Solving',
            description: 'Systematic approach to debugging and solving technical issues.',
            content: `Help me solve a technical problem with [technology/system] involving [specific issue/error] by following a systematic approach:

1. Problem description and symptoms
2. Environment and context information
3. Error messages and logs analysis
4. Hypothesis generation
5. Testing and verification steps
6. Root cause identification
7. Solution implementation
8. Prevention measures for future occurrences

Provide a methodical debugging process that can be applied to any technical issue.`
        },
        {
            id: 7,
            category: 'education',
            title: 'Lesson Plan Structure',
            description: 'Create effective and engaging lesson plans for educational purposes.',
            content: `Generate a comprehensive lesson plan on [topic] for [target audience/grade level] that includes:

1. Learning objectives and outcomes
2. Target audience and prerequisites
3. Materials and resources needed
4. Lesson timeline and activities
5. Teaching methods and strategies
6. Assessment and evaluation methods
7. Differentiation for diverse learners
8. Homework and follow-up activities
9. Reflection and improvement notes

Make the lesson engaging, interactive, and effective for student learning.`
        },
        {
            id: 8,
            category: 'education',
            title: 'Study Guide Creation',
            description: 'Develop effective study guides for better learning and retention.',
            content: `Create an effective study guide for [subject/exam] covering [specific topics/chapters] that includes:

1. Topic overview and key concepts
2. Learning objectives and goals
3. Organized content outline
4. Important definitions and terminology
5. Visual aids and diagrams
6. Practice questions and exercises
7. Memory techniques and mnemonics
8. Self-assessment tools
9. Additional resources for further learning

Focus on making complex information digestible and memorable for effective studying.`
        },
        {
            id: 9,
            category: 'productivity',
            title: 'Project Planning Framework',
            description: 'Structure your projects for maximum efficiency and success.',
            content: `Create a comprehensive project plan for [project name/goal] with a deadline of [timeline] that includes:

1. Project goals and success criteria
2. Scope and deliverables
3. Timeline with milestones
4. Resource requirements and allocation
5. Task breakdown and dependencies
6. Risk assessment and mitigation
7. Communication plan
8. Quality assurance measures
9. Budget and cost tracking
10. Review and adjustment processes

Ensure the plan is actionable, realistic, and adaptable to changing circumstances.`
        },
        {
            id: 10,
            category: 'productivity',
            title: 'Time Management Strategy',
            description: 'Optimize your daily schedule and improve productivity.',
            content: `Develop an effective time management strategy for a [role/profession] with a goal of [primary goal] that includes:

1. Goal setting and prioritization framework
2. Daily schedule optimization
3. Task batching and time blocking techniques
4. Energy management throughout the day
5. Distraction minimization strategies
6. Break and recovery periods
7. Progress tracking and review methods
8. Tools and technology recommendations
9. Habit formation for consistency

Focus on creating a sustainable system that maximizes productivity while preventing burnout.`
        },
        {
            id: 11,
            category: 'research',
            title: 'Research Methodology Outline',
            description: 'Structure your research project with systematic methodology.',
            content: `Create a comprehensive research methodology for a study on [research topic] that includes:

1. Research question and hypothesis
2. Literature review framework
3. Research design and approach
4. Data collection methods
5. Sampling strategy
6. Data analysis techniques
7. Validity and reliability measures
8. Ethical considerations
9. Timeline and milestones
10. Expected outcomes and impact

Ensure the methodology is rigorous, systematic, and appropriate for the research question.`
        },
        {
            id: 12,
            category: 'research',
            title: 'Data Analysis Report',
            description: 'Structure your data analysis reports for clarity and impact.',
            content: `Generate a comprehensive data analysis report for [dataset description] focused on [analysis goal] that includes:

1. Executive summary of key findings
2. Research objectives and questions
3. Data sources and collection methods
4. Data cleaning and preprocessing
5. Exploratory data analysis
6. Statistical methods and tests
7. Visualizations and charts
8. Interpretation of results
9. Limitations and assumptions
10. Recommendations and next steps

Present complex data in a clear, actionable format for decision-makers.`
        },
        {
            id: 13,
            category: 'creative',
            title: 'Poem Generation',
            description: 'Create evocative poems in various styles and formats.',
            content: `Write a poem about [topic] in the style of [style/poet] that includes:

1. Specific imagery and sensory details
2. A consistent rhyme scheme or meter (if applicable)
3. Metaphors and similes related to the theme
4. Emotional resonance or a specific mood
5. A clear beginning, middle, and end

Please ensure the tone matches the requested style and effectively conveys the subject matter.`
        },
        {
            id: 14,
            category: 'business',
            title: 'Professional Email Draft',
            description: 'Compose professional and effective emails for various business situations.',
            content: `Draft a professional email for [situation/purpose] that includes:

1. A clear and concise subject line
2. Professional salutation
3. Context or background information
4. The main request, question, or information
5. Call to action or next steps
6. Professional closing
7. Appropriate tone (formal/polite/assertive)

Ensure the email is concise, respectful, and achieves its intended purpose effectively.`
        },
        {
            id: 15,
            category: 'technical',
            title: 'SQL Query Construction',
            description: 'Generate complex SQL queries based on natural language requirements.',
            content: `Write a SQL query to [objective] assuming a database schema with tables like [table names/structure]. Please include:

1. The complete SELECT statement
2. Any necessary JOINs (INNER, LEFT, RIGHT)
3. WHERE clauses for filtering
4. GROUP BY and HAVING clauses for aggregation
5. ORDER BY for sorting
6. Comments explaining complex logic
7. Optimization considerations (indexes, performance)

Ensure the query is syntactically correct and efficient.`
        },
        {
            id: 16,
            category: 'education',
            title: 'Complex Concept Simplifier',
            description: 'Break down complex topics into easy-to-understand explanations.',
            content: `Explain the concept of [topic] to an audience of [target audience/age group] by:

1. Using simple, accessible language
2. Providing a clear definition
3. Using an analogy or metaphor to illustrate the concept
4. Breaking it down into step-by-step components
5. Giving a real-world example
6. Checking for understanding (rhetorical questions)
7. Summarizing the key takeaways

The explanation should be accurate but simplified enough for the target audience to grasp without prior knowledge.`
        },
        {
            id: 17,
            category: 'productivity',
            title: 'Effective Meeting Agenda',
            description: 'Create structured and productive meeting agendas.',
            content: `Create a detailed meeting agenda for a [meeting type] meeting about [topic] that includes:

1. Meeting objective and expected outcomes
2. Attendees list (optional roles)
3. Pre-meeting preparation or reading
4. Agenda items with time allocations
5. Presenters or leads for each item
6. Discussion points and decision items
7. Action item review and assignment
8. Next meeting date/time

Ensure the agenda is realistic for the allotted time and focused on achieving specific results.`
        },
        {
            id: 18,
            category: 'research',
            title: 'Academic Article Summary',
            description: 'Summarize complex academic articles or papers efficiently.',
            content: `Summarize the attached/following text or article about [topic] by highlighting:

1. The main thesis or argument
2. Key evidence or data presented
3. Methodology used (if applicable)
4. Major conclusions and results
5. Implications or significance of the findings
6. Any limitations or areas for future research
7. Critical analysis or potential bias

Provide a concise yet comprehensive summary that captures the essence of the source material.`
        }
    ];

    // Initialize the library
    function init() {
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            // Check if the category exists in the select options
            const option = categorySelect.querySelector(`option[value="${categoryParam}"]`);
            if (option) {
                categorySelect.value = categoryParam;
            }
        }
        
        // Initial render (will use the selected category)
        handleSearch();
        setupEventListeners();
    }

    // Modal elements
    const modalBackdrop = document.getElementById('prompt-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDescription = document.getElementById('modal-description');
    const modalContent = document.getElementById('modal-content');
    const modalCopyBtn = document.getElementById('modal-copy-btn');
    const modalUseBtn = document.getElementById('modal-use-btn');
    
    // Setup event listeners
    function setupEventListeners() {
        searchInput.addEventListener('input', handleSearch);
        categorySelect.addEventListener('change', handleCategoryFilter);
        
        // Modal events
        modalCloseBtn.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
                closeModal();
            }
        });
        
        // Modal action buttons
        modalCopyBtn.addEventListener('click', handleCopyPrompt);
        modalUseBtn.addEventListener('click', handleUsePrompt);
    }

    // Render prompts to the grid
    function renderPrompts(prompts) {
        if (prompts.length === 0) {
            promptsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No prompts found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        promptsGrid.innerHTML = prompts.map(prompt => `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="prompt-category">${prompt.category}</div>
                <h3 class="prompt-title">${prompt.title}</h3>
                <p class="prompt-description">${prompt.description}</p>
                <div class="prompt-content">${prompt.content}</div>
                <div class="prompt-actions">
                    <button class="prompt-btn use-prompt-btn" data-prompt="${encodeURIComponent(prompt.content)}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Use This Prompt
                    </button>
                    <button class="prompt-btn copy-prompt-btn" data-prompt="${encodeURIComponent(prompt.content)}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = parseInt(card.dataset.id);
                openModal(id);
            });
        });

        document.querySelectorAll('.use-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent modal from opening
                handleUsePrompt(e);
            });
        });

        document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent modal from opening
                handleCopyPrompt(e);
            });
        });
    }

    // Modal Functions
    function openModal(promptId) {
        const prompt = promptTemplates.find(p => p.id === promptId);
        if (!prompt) return;

        // Populate modal data
        modalTitle.textContent = prompt.title;
        modalCategory.textContent = prompt.category;
        modalDescription.textContent = prompt.description;
        modalContent.textContent = prompt.content;
        
        // Update button data attributes
        const encodedContent = encodeURIComponent(prompt.content);
        modalCopyBtn.dataset.prompt = encodedContent;
        modalUseBtn.dataset.prompt = encodedContent;

        // Show modal
        modalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modalBackdrop.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Handle search functionality
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;
        
        let filteredPrompts = promptTemplates;

        // Filter by category
        if (selectedCategory !== 'all') {
            filteredPrompts = filteredPrompts.filter(prompt => 
                prompt.category === selectedCategory
            );
        }

        // Filter by search term
        if (searchTerm) {
            filteredPrompts = filteredPrompts.filter(prompt =>
                prompt.title.toLowerCase().includes(searchTerm) ||
                prompt.description.toLowerCase().includes(searchTerm) ||
                prompt.content.toLowerCase().includes(searchTerm) ||
                prompt.category.toLowerCase().includes(searchTerm)
            );
        }

        renderPrompts(filteredPrompts);
    }

    // Handle category filter
    function handleCategoryFilter() {
        handleSearch(); // Reuse search logic
    }

    // Handle using a prompt
    function handleUsePrompt(event) {
        const promptContent = decodeURIComponent(event.currentTarget.dataset.prompt);
        
        // Store in localStorage for the main app to use
        localStorage.setItem('selectedPrompt', promptContent);
        
        // Show success message
        showNotification('Prompt loaded! Redirecting to Prompt Enhancer...');
        
        // Redirect to main app
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Handle copying a prompt
    async function handleCopyPrompt(event) {
        const promptContent = decodeURIComponent(event.currentTarget.dataset.prompt);
        const button = event.currentTarget;
        
        try {
            await navigator.clipboard.writeText(promptContent);
            
            // Update button to show copied state
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            button.style.color = 'var(--success)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.color = '';
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy prompt:', error);
            showNotification('Failed to copy prompt. Please try again.', 'error');
        }
    }

    // Show notification message
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
            color: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize the library
    init();
});