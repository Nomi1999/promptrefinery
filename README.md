# PromptRefinery

A web-based application designed to refine and polish AI prompts for better responses. Built with modern web technologies and featuring a clean, responsive interface.

## Features

### Core Functionality
- **Prompt Refinement**: Transform basic prompts into detailed, structured instructions
- **Context Support**: Add background information to improve AI understanding
- **Quality Scoring**: Real-time assessment of prompt quality with visual feedback
- **Temperature Control**: Adjustable AI creativity level with slider and preset modes
- **UncloseAI Integration**: Powered by Hermes AI model for intelligent prompt enhancement

### User Interface
- **Dark/Light Theme**: Toggle between light and dark modes with system preference detection
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Split-View Design**: Side-by-side comparison of original and enhanced prompts
- **Quality Indicators**: Visual quality scores with improvement tracking

### Prompt Library
- **Curated Templates**: 60+ pre-built prompt templates across 6 categories
- **Categories Included**:
  - Creative Writing (Storytelling, World-building, Character development)
  - Business & Marketing (Plans, Campaigns, Professional communication)
  - Technical & Development (Documentation, Code, System architecture)
  - Education & Learning (Lesson plans, Study guides, Quizzes)
  - Productivity & Planning (Project management, Time optimization)
  - Research & Analysis (Methodology, Data analysis, Academic writing)
- **Search & Filter**: Find relevant templates quickly with search and category filtering
- **One-Click Use**: Load templates directly into the enhancer

### AI Creativity Controls
- **Temperature Slider**: Adjustable creativity level from 0.0 to 1.0
- **Preset Modes**: Quick selection buttons (Precise, Balanced, Creative, Max)
- **Visual Feedback**: Color-coded temperature display and track fill
- **Optimal Ranges**: AI-suggested temperature settings for different use cases
- **Persistent Settings**: Temperature preference saved across sessions

### Additional Features
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter to enhance, Escape to clear focus
- **Character Counting**: Monitor prompt length with visual indicators
- **Copy to Clipboard**: Easy copying of both original and enhanced prompts
- **Processing Timer**: Track enhancement time for performance monitoring
- **Session Reset**: Clear all fields and start fresh with one click
- **Offline Fallback**: Intelligent fallback enhancement when API is unavailable

## Technologies Used

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS custom properties for theming
- **Vanilla JavaScript**: Pure JavaScript implementation without frameworks
- **Inter Font**: Clean, modern typography from Google Fonts

### API Integration
- **UncloseAI Hermes**: Advanced AI model for prompt enhancement
- **Temperature Parameter**: Dynamic creativity control via API temperature settings
- **RESTful API**: Direct API calls for enhancement processing
- **Error Handling**: Comprehensive error management with fallback strategies

### Storage
- **LocalStorage**: Theme preferences and prompt library integration
- **Session Management**: Temporary state management during enhancement

## Project Structure

```
promptrefinery/
├── index.html              # Main application page
├── prompt-library.html     # Prompt library browser
├── css/
│   └── styles.css          # Complete application styling
├── js/
│   ├── script.js           # Main application logic
│   └── prompt-library.js   # Library management logic
├── robots.txt              # Search engine guidelines
├── sitemap.xml             # Site structure for SEO
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for AI enhancement features

### Installation
1. Clone or download the project files
2. Serve the files using a local web server or host them on a web server
3. Open `index.html` in your browser

### Local Development
For development purposes, you can serve the files using any static web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then access the application at `http://localhost:8000`

## Usage

### Basic Prompt Enhancement
1. Enter your core instruction in the "Original Prompt" panel
2. Add optional context or background information
3. Click "Enhance" or press Ctrl/Cmd + Enter
4. View the enhanced version in the "Enhanced Version" panel
5. Copy the result or reset to try again

### Using the Prompt Library
1. Navigate to the Prompt Library
2. Browse categories or search for specific templates
3. Click on any prompt card to view details
4. Use "Copy" to copy to clipboard or "Use This Prompt" to load in enhancer
5. Customize the template as needed

### Temperature Controls
- **Precise (0.1-0.3)**: Conservative responses, consistent output, technical content
- **Balanced (0.3-0.7)**: Creative but structured responses, versatile applications
- **Creative (0.7-0.9)**: Highly creative responses, innovative ideas, artistic content
- **Max (0.9-1.0)**: Maximum creativity, experimental output, brainstorming

### Quality Scores
- **Input Quality**: Real-time scoring of your original prompt
- **Output Quality**: Scoring of the enhanced prompt
- **Improvement Indicator**: Shows the quality improvement achieved
- **Scoring Factors**: Length, clarity, specificity, context, constraints, and structure

## Configuration

### API Integration
The application uses the UncloseAI Hermes API endpoint. The API key is currently set as a dummy value. For production use:

1. Update the `Authorization` header in `js/script.js` line 238
2. Replace `'dummy-api-key'` with your actual API key
3. Configure the model parameters as needed

### Customization
- **Themes**: Modify CSS custom properties in `css/styles.css`
- **Prompt Templates**: Update the `promptTemplates` array in `js/prompt-library.js`
- **Quality Algorithm**: Adjust scoring weights in `calculateQualityScore()` function

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- **API Response Time**: typically 1-3 seconds for enhancement
- **Bundle Size**: Optimized for fast loading (~200KB total)
- **Memory Usage**: Lightweight implementation with minimal overhead
- **Offline Capability**: Fallback enhancement works without internet

## Security Considerations

- **API Keys**: Store securely in environment variables for production
- **Content Validation**: Basic input sanitization implemented
- **HTTPS Recommended**: Use secure connections for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
- Check the browser console for error messages
- Verify internet connectivity for AI features
- Ensure all files are served from the same origin
- Test with different browsers if needed

---

*Built with focus on usability, accessibility, and performance.*