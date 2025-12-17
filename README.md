# Prompt Enhancer Tool

A web-based tool that enhances prompts for better AI responses using UncloseAI technology. Built with HTML, CSS, and JavaScript for client-side functionality.

## Features

- **Prompt Enhancement**: Transform basic prompts into detailed, effective instructions
- **Real-time Character Counting**: Track your prompt length with visual indicators
- **Copy to Clipboard**: Easily copy both original and enhanced prompts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatically adapts to user preferences
- **Keyboard Shortcuts**: Use Ctrl/Cmd + Enter to enhance prompts quickly
- **Visual Feedback**: Loading states, success/error messages, and animations
- **Quality Scoring System**: Visual quality indicators for both input and output prompts with improvement tracking
- **Prompt Library**: Extensive collection of categorized prompt templates for various use cases
- **Dual-Panel UI**: Split-view interface for comparing original and enhanced prompts side-by-side
- **Context Input**: Additional context field to provide background information for better enhancements
- **Processing Time Display**: Shows how long each enhancement takes
- **Searchable Prompt Templates**: Filter and search through prompt library by category and keyword
- **Prompt Type Detection**: Automatically detects prompt type (creative, technical, explanatory, instructional) for better enhancement
- **Fallback Enhancement**: Provides enhanced prompts even when API is unavailable
- **Reset Functionality**: Clear all inputs and start a new session

## How It Works

1. Enter your original prompt in the input textarea
2. Click "Enhance Prompt" or press Ctrl/Cmd + Enter
3. The tool uses UncloseAI's Hermes model to improve your prompt
4. Copy the enhanced prompt for use with any AI assistant

## Technology Stack

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with responsive design and dark mode support
- **JavaScript (ES6+)**: Interactive functionality with quality scoring algorithms
- **UncloseAI Hermes API**: AI-powered prompt enhancement using Hermes-3-Llama-3.1-8B model
- **GitHub Pages**: Static hosting
- **Feather Icons**: UI iconography
- **Google Fonts (Inter)**: Typography

## Usage

### Online
Visit the GitHub Pages deployment to use the tool directly in your browser.

### Local Development
1. Clone this repository
2. Open `index.html` in your web browser
3. No additional setup required - everything runs client-side

### How to Use the Tool
1. Enter your original prompt in the input textarea under "Core Instruction" (required)
2. Optionally add context/background information in the second textarea
3. Click "Enhance Prompt" or press Ctrl/Cmd + Enter to process your prompt
4. View the enhanced prompt in the output panel alongside the original
5. Use the quality score indicators to compare input and output quality
6. Copy either the original or enhanced prompt to clipboard using the copy buttons
7. Use the prompt library to browse, search, and apply pre-made templates

## Project Structure

```
prompt-enhancer/
├── index.html              # Main application page with dual-panel UI
├── prompt-library.html     # Prompt library page with searchable templates
├── README.md               # This documentation
├── plan.md                 # Original project plan
├── robots.txt              # SEO/robot instructions
├── sitemap.xml             # Site map
├── .gitignore              # Git ignore rules
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment workflow
├── css/
│   └── styles.css          # Complete styling with responsive design and dark mode
├── js/
│   ├── script.js           # Main application logic with UncloseAI integration
│   └── prompt-library.js   # Prompt library functionality with search/filter
└── assets/
    ├── images/
    └── icons/
```

## Key Features Implementation
### UI Components
- Clean, modern interface with intuitive layout
- Input and output textareas with proper labeling
- Action buttons with visual feedback
- Status indicators for processing states
- Character counter with color-coded warnings
- Quality score indicators with visual progress bars
- Dual-panel split view for side-by-side comparison
- Context input field for additional background information
- Sidebar navigation for prompt library access

### Prompt Library
- Extensive collection of categorized prompt templates
- Search functionality to find specific prompts
- Filter by category (Creative, Business, Technical, Education, Productivity, Research)
- Modal view for previewing prompts before use
- Copy and "Use This Prompt" functionality for quick access
- Responsive grid layout for prompt browsing

### Functionality
- **Prompt Enhancement**: Integration with UncloseAI Hermes model
- **Clipboard Operations**: Cross-browser compatible copy functionality
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Performance**: Optimized for fast loading and smooth interactions
- **Accessibility**: Semantic HTML, proper ARIA labels, keyboard navigation
- **Quality Scoring System**: Algorithm that evaluates prompt quality based on length, clarity, specificity, context, constraints, format indicators, and sentence structure
- **Score Improvement Tracking**: Visual indicator showing improvement from input to output quality scores
- **Prompt Type Detection**: Automatically detects prompt type (creative, technical, explanatory, instructional) for better enhancement


### Responsive Design
- Mobile-first approach with breakpoints at 768px and 480px
- Flexible layout that adapts to different screen sizes
- Touch-friendly buttons and controls
- Optimized typography for readability
## API Integration

The tool integrates with UncloseAI's Hermes-3-Llama-3.1-8B model via their API endpoint. When the API is unavailable, the tool provides intelligent fallback enhancements based on prompt type detection (creative, technical, explanatory, instructional).

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Powered by [UncloseAI](https://uncloseai.com) technology
- Icons from [Feather Icons](https://feathericons.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)