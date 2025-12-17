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

## How It Works

1. Enter your original prompt in the input textarea
2. Click "Enhance Prompt" or press Ctrl/Cmd + Enter
3. The tool uses UncloseAI's Hermes model to improve your prompt
4. Copy the enhanced prompt for use with any AI assistant

## Technology Stack

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with responsive design
- **JavaScript (ES6+)**: Interactive functionality
- **UncloseAI**: AI-powered prompt enhancement
- **GitHub Pages**: Static hosting

## Usage

### Online
Visit the GitHub Pages deployment to use the tool directly in your browser.

### Local Development
1. Clone this repository
2. Open `index.html` in your web browser
3. No additional setup required - everything runs client-side

## Project Structure

```
prompt-enhancer/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with responsive design
├── script.js           # All JavaScript functionality
├── README.md           # This documentation
└── plan.md             # Original project plan
```

## Key Features Implementation

### UI Components
- Clean, modern interface with intuitive layout
- Input and output textareas with proper labeling
- Action buttons with visual feedback
- Status indicators for processing states
- Character counter with color-coded warnings

### Functionality
- **Prompt Enhancement**: Integration with UncloseAI Hermes model
- **Clipboard Operations**: Cross-browser compatible copy functionality
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Performance**: Optimized for fast loading and smooth interactions
- **Accessibility**: Semantic HTML, proper ARIA labels, keyboard navigation

### Responsive Design
- Mobile-first approach with breakpoints at 768px and 480px
- Flexible layout that adapts to different screen sizes
- Touch-friendly buttons and controls
- Optimized typography for readability

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