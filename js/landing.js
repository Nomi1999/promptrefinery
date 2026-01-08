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
            enhanceButton.textContent = '';
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
    // Smooth Scrolling
    // ==========================================
    (function() {
        // Smooth scroll function
        function smoothScrollTo(targetElement, duration = 800) {
            if (!targetElement) return;
            
            const start = window.pageYOffset;
            const targetPosition = targetElement.getBoundingClientRect().top + start - 80; // 80px offset for header
            const distance = targetPosition - start;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                // Easing function for smooth acceleration and deceleration
                const easeInOutCubic = progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                window.scrollTo(0, start + distance * easeInOutCubic);
                
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            }

            requestAnimationFrame(animation);
        }

        // Handle smooth scrolling for anchor links
        document.addEventListener('click', function(event) {
            const link = event.target.closest('a[href^="#"]');
            if (link) {
                const targetId = link.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    event.preventDefault();
                    smoothScrollTo(targetElement);
                    
                    // Update URL without triggering page jump
                    history.pushState(null, null, `#${targetId}`);
                }
            }
        });

        // Handle browser back/forward button for anchor navigation
        window.addEventListener('popstate', function() {
            const hash = window.location.hash.slice(1);
            if (hash) {
                const targetElement = document.getElementById(hash);
                if (targetElement) {
                    setTimeout(() => smoothScrollTo(targetElement, 0), 0);
                }
            }
        });

        // Handle initial page load with anchor
        if (window.location.hash) {
            const hash = window.location.hash.slice(1);
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                setTimeout(() => smoothScrollTo(targetElement, 0), 100);
            }
        }
    })();

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

    // ==========================================
    // Workflow Arrow Animation with Trail
    // ==========================================
    (function() {
        const workflowArrow = document.getElementById('workflow-arrow');
        
        if (!workflowArrow) {
            return;
        }

        // Container for trail elements
        const stepsSection = document.getElementById('how-it-works');
        const stepsGrid = document.querySelector('.steps-grid');
        
        if (!stepsSection || !stepsGrid) {
            return;
        }

        // Calculate and set arrow positions for mobile animation
        function updateArrowPositions() {
            // Only needed for mobile layout where cards are stacked
            if (window.innerWidth > 640) return;

            const cards = stepsGrid.querySelectorAll('.step-card');
            if (cards.length < 3) return;

            // Calculate center position of the number circle for each step
            // .step-number is absolute at top:0, height:40px -> center is 20px
            // relative to the card's top
            const pos1 = cards[0].offsetTop + 20;
            const pos2 = cards[1].offsetTop + 20;
            const pos3 = cards[2].offsetTop + 20;

            // Set CSS variables on the arrow element
            workflowArrow.style.setProperty('--step-1-top', `${pos1}px`);
            workflowArrow.style.setProperty('--step-2-top', `${pos2}px`);
            workflowArrow.style.setProperty('--step-3-top', `${pos3}px`);
            
            console.log('[Arrow Position] Updated keyframes:', pos1, pos2, pos3);
        }

        // Update positions on load and resize
        updateArrowPositions();
        window.addEventListener('resize', updateArrowPositions);
        // Also update after a short delay to ensure layout is settled
        setTimeout(updateArrowPositions, 500);

        // Trail configuration
        const trailConfig = {
            interval: 50, // Create trail every 50ms
            maxTrails: 20, // Maximum number of trail elements
            trailLifetime: 800, // How long trail lasts in ms
            isMobile: window.innerWidth <= 640
        };

        // Store trail elements
        const trails = [];
        let trailInterval = null;
        let animationActive = false;

        // Create a trail element
        function createTrail() {
            const trail = document.createElement('div');
            trail.className = 'workflow-arrow-trail';
            
            // Get current arrow position
            const arrowRect = workflowArrow.getBoundingClientRect();
            const gridRect = stepsGrid.getBoundingClientRect();
            
            // Calculate position relative to the grid
            const relativeTop = arrowRect.top - gridRect.top + (arrowRect.height / 2);
            const relativeLeft = arrowRect.left - gridRect.left + (arrowRect.width / 2);
            
            trail.style.top = relativeTop + 'px';
            trail.style.left = relativeLeft + 'px';
            trail.style.opacity = '0.6';
            
            // Add SVG to trail
            trail.innerHTML = workflowArrow.innerHTML;
            
            // Add to DOM
            stepsGrid.appendChild(trail);
            
            // Animate trail fade
            trail.style.animation = `trailFade ${trailConfig.trailLifetime}ms ease-out forwards`;
            
            // Store trail reference
            trails.push({
                element: trail,
                createdAt: Date.now()
            });
            
            // Remove trail after animation
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
                // Remove from trails array
                const index = trails.findIndex(t => t.element === trail);
                if (index > -1) {
                    trails.splice(index, 1);
                }
            }, trailConfig.trailLifetime);
            
            // Limit number of trails
            if (trails.length > trailConfig.maxTrails) {
                const oldTrail = trails.shift();
                if (oldTrail.element.parentNode) {
                    oldTrail.element.parentNode.removeChild(oldTrail.element);
                }
            }
        }

        // Start creating trails
        function startTrail() {
            if (trailInterval) return;
            trailInterval = setInterval(createTrail, trailConfig.interval);
        }

        // Stop creating trails
        function stopTrail() {
            if (trailInterval) {
                clearInterval(trailInterval);
                trailInterval = null;
            }
        }

        // Start animation when workflow section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                console.log('[Arrow Animation] Intersection:', entry.isIntersecting, entry.target.id);
                if (entry.isIntersecting) {
                    workflowArrow.classList.add('animate');
                    animationActive = true;
                    startTrail();
                    console.log('[Arrow Animation] Started - Section visible');
                } else {
                    animationActive = false;
                    stopTrail();
                    console.log('[Arrow Animation] Stopped - Section not visible');
                }
            });
        }, {
            threshold: 0.3  // Trigger when 30% of section is visible
        });

        observer.observe(stepsSection);

        // Monitor arrow position during animation
        let positionCheckInterval = null;
        const checkArrowPosition = () => {
            if (!animationActive) return;
            const arrowRect = workflowArrow.getBoundingClientRect();
            const gridRect = stepsGrid.getBoundingClientRect();
            const relativeTop = arrowRect.top - gridRect.top;
            console.log('[Arrow Position] Relative top:', relativeTop.toFixed(1), 'px');
            
            // Log expected positions for debugging
            const step1Pos = 20;
            const step2Pos = 20 + 80; // 2rem gap = ~80px
            const step3Pos = 20 + 160; // 2 steps down
            console.log('[Arrow Position] Expected: Step1=' + step1Pos + ', Step2=' + step2Pos + ', Step3=' + step3Pos);
        };

        // Start position monitoring when animation begins
        workflowArrow.addEventListener('animationstart', () => {
            console.log('[Arrow Animation] Animation started');
            positionCheckInterval = setInterval(checkArrowPosition, 500);
        });
        
        workflowArrow.addEventListener('animationend', () => {
            console.log('[Arrow Animation] Animation ended');
            if (positionCheckInterval) {
                clearInterval(positionCheckInterval);
                positionCheckInterval = null;
            }
        });

        // Clean up trails on page unload
        window.addEventListener('beforeunload', () => {
            stopTrail();
            trails.forEach(trail => {
                if (trail.element.parentNode) {
                    trail.element.parentNode.removeChild(trail.element);
                }
            });
        });

        // Handle window resize for mobile detection
        window.addEventListener('resize', () => {
            trailConfig.isMobile = window.innerWidth <= 640;
        });
    })();
});
