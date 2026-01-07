document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const promptsGrid = document.getElementById('prompts-grid');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Notification system state
    let activeNotification = null;
    let notificationQueue = [];
    let isNotificationAnimating = false;

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
        },
        {
            id: 19,
            category: 'creative',
            title: 'Character Dialogue Generation',
            description: 'Write realistic and engaging dialogue between characters.',
            content: `Write a dialogue between [Character A] and [Character B] in a [setting/situation] that reveals:

1. Character A's current emotional state
2. Character B's hidden agenda or secret
3. The relationship dynamic between them
4. A specific plot point or conflict

Ensure the dialogue sounds natural, distinct for each character, and advances the story.`
        },
        {
            id: 20,
            category: 'business',
            title: 'Job Interview Simulator',
            description: 'Practice for job interviews with role-specific questions and feedback.',
            content: `Act as an interviewer for a [Job Role] position at [Company Type/Industry].

1. Ask me a series of 5 common interview questions for this role, one by one.
2. Wait for my response after each question.
3. After I respond, provide feedback on my answer, highlighting strengths and areas for improvement.
4. At the end, give an overall assessment of my performance.

Start by asking the first question.`
        },
        {
            id: 21,
            category: 'technical',
            title: 'System Architecture Blueprint',
            description: 'Design a high-level architecture for a software system.',
            content: `Design a high-level system architecture for [System Name/Type] that handles [Key Functional Requirement]. Include:

1. High-level diagram description (components and interactions)
2. Database schema design (key tables and relationships)
3. API endpoints definition (REST/GraphQL)
4. Technology stack recommendations (Frontend, Backend, Database)
5. Scalability and performance considerations
6. Security measures and best practices

Explain the reasoning behind your architectural choices.`
        },
        {
            id: 22,
            category: 'education',
            title: 'Educational Quiz Generator',
            description: 'Create quizzes to test knowledge on any subject.',
            content: `Create a [Number of Questions]-question quiz on [Topic] for [Target Audience] level.

1. Include a mix of multiple-choice, true/false, and short answer questions.
2. Provide the correct answer and a brief explanation for each question.
3. Organize the questions by difficulty (easy, medium, hard).
4. Include a scoring guide or grading scale.

Make the questions challenging but fair for the intended audience.`
        },
        {
            id: 23,
            category: 'productivity',
            title: 'SMART Goal Framework',
            description: 'Transform vague ideas into actionable SMART goals.',
            content: `Help me refine the following goal into a SMART goal: "[Insert Vague Goal]".

1. **Specific:** What exactly needs to be accomplished?
2. **Measurable:** How will I track progress and measure success?
3. **Achievable:** Is the goal realistic and attainable?
4. **Relevant:** Why does this goal matter?
5. **Time-bound:** When is the deadline?

Break down the final SMART goal into a list of immediate next steps.`
        },
        {
            id: 24,
            category: 'research',
            title: 'Research Survey Design',
            description: 'Create effective surveys to gather reliable data.',
            content: `Design a research survey to investigate [Research Topic/Question] targeting [Target Population]. Include:

1. Survey introduction and consent statement.
2. Demographic questions (e.g., age, gender, location).
3. A mix of closed-ended (Likert scale, multiple choice) and open-ended questions.
4. Questions designed to avoid bias and leading language.
5. A closing statement thanking the participants.

Ensure the questions directly address the research objectives and provide actionable data.`
        },
        // Creative Prompts (New)
        {
            id: 25,
            category: 'creative',
            title: 'Plot Twist Generator',
            description: 'Generate unexpected plot twists to surprise your readers.',
            content: `Generate 5 potential plot twists for a story about [premise/characters] where the main conflict is [conflict]. 

For each twist:
1. Describe the twist event.
2. Explain how it changes the story's direction.
3. Detail the impact on the protagonist.

Ensure the twists are surprising but consistent with the established world.`
        },
        {
            id: 26,
            category: 'creative',
            title: 'Setting Description Enhancer',
            description: 'Add sensory details to bring your settings to life.',
            content: `Rewrite the following setting description to include all five senses (sight, sound, smell, taste, touch):

"[Insert current description]"

Enhance the atmosphere to convey a feeling of [mood, e.g., dread, wonder, isolation].`
        },
        {
            id: 27,
            category: 'creative',
            title: 'Villain Motivation',
            description: 'Create complex and relatable villains.',
            content: `Develop a backstory and motivation for a villain who wants to [villain's goal] because [reason], ensuring they are not purely evil. Include:

1. A definitive "wound" or past trauma.
2. A twisted justification for their actions.
3. A redeeming quality or a line they won't cross.
4. Their view of the protagonist.`
        },
        {
            id: 28,
            category: 'creative',
            title: 'Magic System Design',
            description: 'Create a unique and balanced magic system.',
            content: `Design a magic system based on [core concept/element]. Detail:

1. The source of the magic.
2. How it is learned or acquired.
3. Hard rules and limitations (what it CANNOT do).
4. The cost or consequence of using it.
5. How it affects society/culture.`
        },
        {
            id: 29,
            category: 'creative',
            title: 'Dialogue Subtext',
            description: 'Write dialogue that conveys meaning beyond the words.',
            content: `Write a scene between two characters who are discussing [surface topic] but are actually angry about [hidden issue]. 

Focus on:
1. What they are NOT saying.
2. Physical actions that betray their true feelings.
3. Passive-aggressive comments.
4. The tension rising without an explicit explosion.`
        },
        {
            id: 30,
            category: 'creative',
            title: 'Story Starter',
            description: 'Overcome writer\'s block with a compelling opening.',
            content: `Write an opening paragraph for a story that begins with the sentence: "[Opening sentence]" and sets a tone of [tone]. 

Introduce:
1. The protagonist.
2. The immediate setting.
3. A hint of the inciting incident.`
        },
        // Business Prompts (New)
        {
            id: 31,
            category: 'business',
            title: 'SWOT Analysis',
            description: 'Conduct a strategic analysis of a business or project.',
            content: `Perform a SWOT analysis for [company/product] operating in the [industry] market. List 3-5 items for each:

1. **Strengths:** Internal positive factors.
2. **Weaknesses:** Internal negative factors.
3. **Opportunities:** External positive factors.
4. **Threats:** External negative factors.

Conclude with a strategic recommendation based on the analysis.`
        },
        {
            id: 32,
            category: 'business',
            title: 'Elevator Pitch',
            description: 'Craft a persuasive short pitch for your idea.',
            content: `Create a 30-second elevator pitch for [product/service]. The pitch should address:

1. The specific problem you are solving.
2. Your unique solution.
3. The target market.
4. The key benefit/value proposition.

Make it punchy, memorable, and clear.`
        },
        {
            id: 33,
            category: 'business',
            title: 'Competitor Analysis',
            description: 'Analyze the competitive landscape.',
            content: `Conduct a competitor analysis for [company] comparing it against [competitor 1] and [competitor 2]. Compare them on:

1. Pricing strategy.
2. Key features/product offering.
3. Target audience overlap.
4. Marketing strengths.
5. Customer reviews/sentiment.`
        },
        {
            id: 34,
            category: 'business',
            title: 'Product Launch Plan',
            description: 'Plan a successful product launch.',
            content: `Outline a 4-week product launch plan for [product name]. Include:

1. **Week 1 (Tease):** Social media strategy and email warm-ups.
2. **Week 2 (Hype):** Influencer outreach and content drops.
3. **Week 3 (Launch):** Launch day checklist and events.
4. **Week 4 (Sustain):** Follow-up and user engagement.

Identify key metrics to track success.`
        },
        {
            id: 35,
            category: 'business',
            title: 'Customer Persona',
            description: 'Define your ideal customer.',
            content: `Create a detailed customer persona for [product/service]. Include:

1. **Demographics:** Age, location, job title, income.
2. **Psychographics:** Interests, values, lifestyle.
3. **Pain Points:** What keeps them up at night?
4. **Goals:** What do they want to achieve?
5. **Buying Behavior:** How do they make purchasing decisions?`
        },
        {
            id: 36,
            category: 'business',
            title: 'Meeting Minutes Template',
            description: 'Record meeting outcomes effectively.',
            content: `Draft a template for meeting minutes for a [meeting type]. The template should have sections for:

1. Meeting details (Date, Time, Location).
2. Attendees and Absentees.
3. Agenda Items.
4. Discussion Summary per item.
5. **Decisions Made:** Clear record of what was agreed.
6. **Action Items:** Who, What, By When.
7. Next Meeting Date.`
        },
        // Technical Prompts (New)
        {
            id: 37,
            category: 'technical',
            title: 'Regex Generator',
            description: 'Create regular expressions for pattern matching.',
            content: `Generate a Regular Expression (Regex) to match [pattern description, e.g., email, date format]. 

1. Provide the Regex string.
2. Explain what each part of the regex does.
3. Provide 3 examples of strings that match.
4. Provide 3 examples of strings that do NOT match.`
        },
        {
            id: 38,
            category: 'technical',
            title: 'Git Workflow',
            description: 'Standardize version control practices.',
            content: `Describe a Git workflow for a team of [number] developers working on [project type]. Define:

1. Branching strategy (e.g., Gitflow, trunk-based).
2. Naming conventions for branches.
3. Commit message standards.
4. The Pull Request/Code Review process.
5. Handling merge conflicts.`
        },
        {
            id: 39,
            category: 'technical',
            title: 'API Endpoint Design',
            description: 'Design RESTful API endpoints.',
            content: `Design the API endpoints for a [resource name] resource. Include:

1. **GET /resource:** List with pagination/filtering parameters.
2. **GET /resource/{id}:** Single item retrieval.
3. **POST /resource:** Creation payload and validation.
4. **PUT/PATCH /resource/{id}:** Update logic.
5. **DELETE /resource/{id}:** Deletion logic.

Specify standard HTTP status codes for success and error scenarios.`
        },
        {
            id: 40,
            category: 'technical',
            title: 'Docker Compose Setup',
            description: 'Containerize applications with Docker Compose.',
            content: `Create a \`docker-compose.yml\` structure for a stack consisting of:
- [Service 1 (e.g., Node.js App)]
- [Service 2 (e.g., Redis)]
- [Database (e.g., PostgreSQL)]

Include:
1. Image/Build context.
2. Port mappings.
3. Environment variable injection.
4. Volume mounts for persistence.
5. Network configuration.`
        },
        {
            id: 41,
            category: 'technical',
            title: 'Unit Test Case Generation',
            description: 'Write comprehensive unit tests.',
            content: `Generate a list of unit test cases for a function that [function description]. Include:

1. **Happy Path:** Standard valid inputs.
2. **Edge Cases:** Minimum/maximum values, empty inputs.
3. **Error Handling:** Invalid types, null values.
4. **Performance:** Large inputs (if applicable).

Describe the expected input and output for each case.`
        },
        {
            id: 42,
            category: 'technical',
            title: 'Security Audit Checklist',
            description: 'Ensure application security.',
            content: `Create a security audit checklist for a [web/mobile] application. Cover:

1. **Authentication:** Password policies, MFA.
2. **Authorization:** Role-based access control.
3. **Data Protection:** Encryption at rest and in transit.
4. **Input Validation:** SQL injection, XSS prevention.
5. **Dependency Management:** Vulnerability scanning.`
        },
        // Education Prompts (New)
        {
            id: 43,
            category: 'education',
            title: 'Rubric Creator',
            description: 'Design fair and clear grading rubrics.',
            content: `Create a grading rubric for a [assignment type] assignment. 

Define 4 levels of proficiency: Excellent (4), Proficient (3), Developing (2), Needs Improvement (1).
Create rows for the following criteria:
1. [Criteria 1]
2. [Criteria 2]
3. [Criteria 3]

Provide a brief description of what constitutes each level for each criteria.`
        },
        {
            id: 44,
            category: 'education',
            title: 'Flashcard Generator',
            description: 'Create study flashcards for key concepts.',
            content: `Generate a set of 10 study flashcards for the topic of [topic]. 

Format as:
**Front:** [Term/Concept]
**Back:** [Clear, concise definition or explanation]

Ensure the definitions are accurate and easy to memorize.`
        },
        {
            id: 45,
            category: 'education',
            title: 'Essay Outline',
            description: 'Structure academic essays.',
            content: `Create a detailed outline for an argumentative essay on [topic]. Include:

1. **Introduction:** Hook, background info, Thesis Statement.
2. **Body Paragraph 1:** Main argument 1 + evidence.
3. **Body Paragraph 2:** Main argument 2 + evidence.
4. **Body Paragraph 3:** Counter-argument + refutation.
5. **Conclusion:** Restate thesis, summary of points, closing thought.`
        },
        {
            id: 46,
            category: 'education',
            title: 'Classroom Icebreaker',
            description: 'Engage students with fun introductory activities.',
            content: `Suggest 3 interactive icebreaker activities for a class of [age group] students. 

The goal is to:
1. Help them learn names.
2. Introduce the topic of [topic].
3. Build energy and comfort.

Provide instructions and necessary materials for each.`
        },
        {
            id: 47,
            category: 'education',
            title: 'Feedback Generator',
            description: 'Provide constructive feedback to students.',
            content: `Draft a feedback note for a student who submitted [assignment type].
- **Strengths:** [Mention 1-2 things they did well].
- **Areas for Improvement:** [Mention the specific struggle with concept].
- **Actionable Advice:** [How can they fix it?].
- **Encouragement:** A positive closing statement.

Keep the tone supportive and growth-oriented.`
        },
        {
            id: 48,
            category: 'education',
            title: 'Course Syllabus',
            description: 'Outline a complete course.',
            content: `Create a course syllabus for [course name] that runs for [duration]. Include:

1. **Course Description:** Overview of the subject.
2. **Learning Objectives:** What students will be able to do by the end.
3. **Weekly Schedule:** Topic breakdown by week.
4. **Assessment Methods:** How grades are calculated (exams, projects, etc.).
5. **Required Resources:** Books, software, materials.`
        },
        // Productivity Prompts (New)
        {
            id: 49,
            category: 'productivity',
            title: 'Pomodoro Planner',
            description: 'Plan tasks using the Pomodoro technique.',
            content: `Break down the project [project name] into 25-minute Pomodoro intervals. 

List 4-6 intervals. For each:
1. **Task:** Specific action to take.
2. **Goal:** What constitutes "done" for this interval.

Include a 5-minute break activity between each.`
        },
        {
            id: 50,
            category: 'productivity',
            title: 'Email Triage System',
            description: 'Organize and prioritize your inbox.',
            content: `Create a system for processing a full inbox. Define rules for:

1. **Delete/Archive:** what goes here immediately?
2. **Delegate:** criteria for forwarding to others.
3. **Defer:** what gets scheduled for later?
4. **Do:** what must be answered in <2 minutes?

Provide a step-by-step workflow to clear the inbox in 30 minutes.`
        },
        {
            id: 51,
            category: 'productivity',
            title: 'Habit Tracker Layout',
            description: 'Track and build new habits.',
            content: `Design a weekly habit tracker for [Habit 1], [Habit 2], and [Habit 3].

Include:
1. A checkbox grid for Mon-Sun.
2. A "Trigger" column (when will you do it?).
3. A "Reward" column (what do you get for completing it?).
4. A reflection section for end-of-week analysis.`
        },
        {
            id: 52,
            category: 'productivity',
            title: 'Decision Matrix',
            description: 'Make objective decisions.',
            content: `Create a decision matrix to choose between [Option A] and [Option B]. 

1. List 5 key criteria (e.g., Cost, Time, Impact).
2. Assign a weight (1-5) to each criteria based on importance.
3. Explain how to score each option (1-10).
4. Provide the formula to calculate the weighted score.`
        },
        {
            id: 53,
            category: 'productivity',
            title: 'Weekly Review Checklist',
            description: 'Reflect on the past week and plan the next.',
            content: `Create a checklist for a Friday Weekly Review. Steps should include:

1. **Clear:** Emptying physical and digital inboxes.
2. **Review:** Checking calendar (past and upcoming 2 weeks).
3. **Reflect:** What went well? What didn't?
4. **Plan:** Top 3 priorities for next week.

Ensure the process can be completed in 20-30 minutes.`
        },
        {
            id: 54,
            category: 'productivity',
            title: 'Morning Routine Design',
            description: 'Design a productive morning routine.',
            content: `Design a morning routine for someone who wants to achieve [goal] and starts work at [time]. 

The routine should include:
1. Hydration/Nutrition.
2. Movement/Exercise.
3. Mindfulness/Meditation.
4. Top Priority Planning.

Provide a timeline (e.g., 6:00 AM - 6:15 AM) for each step.`
        },
        // Research Prompts (New)
        {
            id: 55,
            category: 'research',
            title: 'Literature Review Matrix',
            description: 'Organize research sources.',
            content: `Create a column structure for a Literature Review Matrix to organize sources on [topic]. Columns should include:

1. **Citation:** (Author, Year).
2. **Methodology:** (Qualitative/Quantitative, Sample size).
3. **Key Findings:** Main results relevant to [topic].
4. **Strengths/Weaknesses:** Critical analysis.
5. **Relevance:** How it connects to your specific research question.`
        },
        {
            id: 56,
            category: 'research',
            title: 'Interview Question Set',
            description: 'Prepare for qualitative research interviews.',
            content: `Draft 10 semi-structured interview questions for a study on [topic]. 

1. Start with rapport-building questions.
2. Move to core investigative questions.
3. Include follow-up probes (e.g., "Can you tell me more about...?").
4. End with a catch-all ("Is there anything else...?").

Ensure questions are open-ended and non-leading.`
        },
        {
            id: 57,
            category: 'research',
            title: 'Statistical Test Selector',
            description: 'Choose the right statistical test.',
            content: `Help me select the right statistical test.
My Independent Variable is: [Type: Nominal/Ordinal/Interval/Ratio].
My Dependent Variable is: [Type: Nominal/Ordinal/Interval/Ratio].
Distribution: [Normal/Non-Normal].

Based on this, suggest:
1. The appropriate test (e.g., T-test, ANOVA, Chi-Square).
2. Why this test fits the data types.
3. The assumptions that must be met.`
        },
        {
            id: 58,
            category: 'research',
            title: 'Abstract Generator',
            description: 'Write a concise research abstract.',
            content: `Draft a research abstract for a paper titled "[Title]". Limit to 250 words. Structure it as:

1. **Background:** Context and problem statement (1-2 sentences).
2. **Methods:** Brief description of approach (1-2 sentences).
3. **Results:** Key findings and data (2-3 sentences).
4. **Conclusion:** Implications and significance (1 sentence).`
        },
        {
            id: 59,
            category: 'research',
            title: 'Citation Formatter',
            description: 'Format citations correctly.',
            content: `Format the following source details into [Citation Style, e.g., APA 7, MLA 8, Chicago]:

Author: [Author Name]
Title: [Title of Work]
Publication: [Journal/Publisher]
Year: [Year]
Page Numbers: [Pages]
URL/DOI: [Link]

Provide both the **In-text Citation** format and the **Reference List** entry.`
        },
        {
            id: 60,
            category: 'research',
            title: 'Research Proposal Outline',
            description: 'Outline a research project proposal.',
            content: `Outline a research proposal for [Topic]. Include:

1. **Title:** Working title.
2. **Problem Statement:** The gap in knowledge.
3. **Research Questions:** Specific questions to answer.
4. **Methodology:** Proposed design and methods.
5. **Significance:** Why this research matters.
6. **Timeline:** Key phases (e.g., Literature Review, Data Collection, Analysis).`
        }
    ];

    // Initialize the library
    function init() {
        initTheme();
        
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
        
        // Update category counts
        updateCategoryCounts();
        
        // Initial render (will use the selected category)
        handleSearch();
        setupEventListeners();
    }

    // Update category counts in the dropdown
    function updateCategoryCounts() {
        // Calculate counts
        const counts = promptTemplates.reduce((acc, prompt) => {
            acc[prompt.category] = (acc[prompt.category] || 0) + 1;
            return acc;
        }, {});
        
        const totalCount = promptTemplates.length;

        // Update dropdown options
        Array.from(categorySelect.options).forEach(option => {
            const currentText = option.textContent;
            
            if (option.value === 'all') {
                option.textContent = `${currentText} (${totalCount})`;
            } else {
                const count = counts[option.value] || 0;
                option.textContent = `${currentText} (${count})`;
            }
        });
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
        
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }
        
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

    // Highlight search matches in text
    function highlightMatches(text, query) {
        if (!query) return text;
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    // Render prompts to the grid
    function renderPrompts(prompts) {
        const searchTerm = searchInput.value.trim();

        if (prompts.length === 0) {
            promptsGrid.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3 class="empty-state-title">No prompts found</h3>
                    <p class="empty-state-description">Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        promptsGrid.innerHTML = prompts.map(prompt => `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="prompt-category" data-category="${prompt.category}">${prompt.category}</div>
                <h3 class="prompt-title">${highlightMatches(prompt.title, searchTerm)}</h3>
                <p class="prompt-description">${highlightMatches(prompt.description, searchTerm)}</p>
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

// Only add listeners to grid buttons (not modal buttons)
        document.querySelectorAll('.prompt-card .use-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent modal from opening
                handleUsePrompt(e);
            });
        });

        document.querySelectorAll('.prompt-card .copy-prompt-btn').forEach(btn => {
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
        modalCategory.setAttribute('data-category', prompt.category);
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
        showNotification('Prompt loaded! Redirecting to Prompt Enhancer...', 'info');
        
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
        
        // No success notification for theme toggle on library page to avoid clutter, 
        // or we could add a simple console log if needed.
        // If we want a notification, we can use the existing showNotification function
        showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info');
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcons(theme);
    }
    
function updateThemeIcons(theme) {
        // Update theme toggle icons
        if (theme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
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

    // Initialize the library
    init();
});