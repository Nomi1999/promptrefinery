document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ==========================================
    // Landing Page Demo Animation
    // ==========================================
    (function() {
        const originalTextElement = document.querySelector('.original-prompt');
        const enhancedTextElement = document.querySelector('.enhanced-prompt');
        const enhanceButton = document.getElementById('demo-enhance-btn');
        
        // Check if elements exist before proceeding
        if (!originalTextElement || !enhancedTextElement || !enhanceButton) {
            return;
        }

        const btnText = enhanceButton.querySelector('.btn-text');
        const spinner = enhanceButton.querySelector('.loading-spinner');
        const summaryElement = document.querySelector('.enhancement-summary');

        const originalPrompt = "Write a blog post about gardening";
        const enhancedPrompt = "Write a comprehensive blog post about the joys and benefits of gardening, covering topics such as plant selection, soil preparation, watering techniques, and tips for maintaining a thriving garden throughout the seasons.";

        // Typewriter effect function
        function typeWriter(element, text, callback, speed = 100) {
            let index = 0;
            element.textContent = '';

            function type() {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, speed);
                } else if (callback) {
                    callback();
                }
            }

            type();
        }

        // Button click animation
        function animateButtonClick() {
            enhanceButton.classList.add('clicking');
            setTimeout(() => {
                enhanceButton.classList.remove('clicking');
            }, 150);
        }

        // Main animation sequence
        function runAnimationSequence() {
            // Reset state
            originalTextElement.textContent = '';
            enhancedTextElement.textContent = '';
            summaryElement.classList.remove('visible');
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            enhanceButton.disabled = false;
            enhanceButton.textContent = 'Enhance';
            enhanceButton.appendChild(btnText);
            enhanceButton.appendChild(spinner);

            // Phase 1: Type original prompt
            typeWriter(originalTextElement, originalPrompt, () => {
                // Phase 2: Click button after short delay
                setTimeout(() => {
                    animateButtonClick();

                    // Show loading state
                    btnText.style.display = 'none';
                    spinner.style.display = 'inline-block';
                    enhanceButton.disabled = true;

                    // Phase 3: Wait 1 second (simulate API)
                    setTimeout(() => {
                        // Phase 4: Type enhanced prompt
                        typeWriter(enhancedTextElement, enhancedPrompt, () => {
                            // Show summary
                            summaryElement.classList.add('visible');

                            // Phase 5: Wait and loop
                            setTimeout(runAnimationSequence, 3000);
                        }, 15); // Faster typing for longer text

                    }, 1000);

                }, 500); // Short delay before button click
            }, 50); // Typing speed
        }

        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runAnimationSequence();
                    observer.disconnect(); // Only start once
                }
            });
        }, { threshold: 0.5 });

        const mockupBody = document.querySelector('.mockup-body');
        if (mockupBody) {
            observer.observe(mockupBody);
        }
    })();

    // ==========================================
    // Scroll Animation System
    // ==========================================
    (function() {
        // Observer options
        const observerOptions = {
            threshold: 0.15,  // Trigger when 15% of element is visible
            rootMargin: '0px 0px -50px 0px'  // Trigger slightly before element enters viewport
        };
        
        // Create observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Trigger animation
                    element.classList.remove('animate-hidden');
                    element.classList.add('animate-visible');
                    
                    // Stop observing after animation
                    observer.unobserve(element);
                }
            });
        }, observerOptions);
        
        // Find all elements with animate-hidden class
        const animateElements = document.querySelectorAll('.animate-hidden');
        animateElements.forEach(element => {
            observer.observe(element);
        });
        
        // Special case: Hero section - animate immediately on load
        // This ensures content is visible even if JS loads late or intersection observer fails
        const heroElements = document.querySelectorAll('.hero-section .animate-hidden');
        if (heroElements.length > 0) {
            // Small delay to ensure DOM layout is settled and transitions play smoothly
            setTimeout(() => {
                heroElements.forEach(element => {
                    element.classList.remove('animate-hidden');
                    element.classList.add('animate-visible');
                    // Unobserve hero elements since we manually triggered them
                    observer.unobserve(element);
                });
            }, 100);
        }
    })();

    // ==========================================
    // Theme Handling
    // ==========================================
    function updateLogos() {
        const navLogo = document.getElementById('nav-logo');
        const footerLogo = document.getElementById('footer-logo');
        const theme = document.documentElement.getAttribute('data-theme');
        const src = theme === 'dark'
            ? 'assets/images/logo-dark-background.webp'
            : 'assets/images/logo-light-background.webp';

        if (navLogo) navLogo.src = src;
        if (footerLogo) footerLogo.src = src;
    }

    // Toggle Theme Function
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            // updateLogos will be called by the observer
        });
    }

    // Initial update
    updateLogos();

    // Listen for theme changes from system
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            updateLogos();
        }
    });

    // Listen for manual theme toggles (using MutationObserver on html element)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                updateLogos();
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true //configure it to listen to attribute changes
    });

    // ==========================================
    // Mobile Menu
    // ==========================================
    (function() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const landingLinks = document.querySelector('.landing-links');
        
        if (mobileMenuBtn && landingLinks) {
            mobileMenuBtn.addEventListener('click', function() {
                const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
                mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
                landingLinks.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!landingLinks.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                    landingLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Close menu when a link is clicked
            landingLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                     landingLinks.classList.remove('active');
                     mobileMenuBtn.classList.remove('active');
                     mobileMenuBtn.setAttribute('aria-expanded', 'false');
                });
            });
        }
    })();
});
