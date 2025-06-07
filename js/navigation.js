// js/navigation.js - Simple Navigation Logic

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for internal links
    initializeSmoothScrolling();
    
    // Navigation highlight on scroll
    initializeScrollHighlight();
    
    // Interaction tracking for psychology demonstration
    initializeInteractionTracking();
    
    // Dynamic content updates
    initializeDynamicContent();
    
    console.log('🧠 Navigation psychology systems initialized');
});

// Smooth scrolling implementation
function initializeSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                // Smooth scroll with easing
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, '#' + targetId);
                
                // Track navigation interaction
                trackInteraction('navigation', targetId);
            }
        });
    });
}

// Navigation highlight based on scroll position
function initializeScrollHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    function updateActiveNavigation() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // Update page metadata for psychology tracking
                updatePageContext(sectionId);
            }
        });
    }
    
    // Throttled scroll listener for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(updateActiveNavigation, 10);
    });
}

// Interaction tracking for psychological analysis
function initializeInteractionTracking() {
    let interactionCount = 0;
    let sessionStartTime = Date.now();
    
    // Track various interaction types
    document.addEventListener('click', function(e) {
        interactionCount++;
        updateInteractionMetrics();
        
        // Track specific psychological elements
        if (e.target.closest('.demo-card')) {
            trackInteraction('demo-exploration', e.target.closest('.demo-card').className);
        }
        
        if (e.target.closest('.skill-card')) {
            trackInteraction('skill-interest', e.target.closest('.skill-card').className);
        }
    });
    
    // Track hover behavior for attention analysis
    const interactiveElements = document.querySelectorAll('.demo-card, .skill-card, .cta-button');
    
    interactiveElements.forEach(element => {
        let hoverStartTime;
        
        element.addEventListener('mouseenter', function() {
            hoverStartTime = Date.now();
            this.style.setProperty('--hover-duration', '0s');
        });
        
        element.addEventListener('mouseleave', function() {
            if (hoverStartTime) {
                const hoverDuration = Date.now() - hoverStartTime;
                this.style.setProperty('--hover-duration', `${hoverDuration}ms`);
                
                // Track attention patterns
                if (hoverDuration > 1000) {
                    trackInteraction('deep-attention', this.className);
                }
            }
        });
    });
    
    function updateInteractionMetrics() {
        const interactionCounter = document.getElementById('interactionCount');
        if (interactionCounter) {
            interactionCounter.textContent = interactionCount;
        }
        
        // Update cognitive load based on interaction frequency
        const sessionDuration = (Date.now() - sessionStartTime) / 1000;
        const interactionRate = interactionCount / sessionDuration;
        updateCognitiveLoad(interactionRate);
    }
}

// Dynamic content updates for psychological engagement
function initializeDynamicContent() {
    // Animate statistics counters
    animateCounters();
    
    // Update real-time psychology metrics
    setInterval(updatePsychologyMetrics, 3000);
    
    // Dynamic background color based on user behavior
    updateBackgroundMood();
}

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const finalValue = counter.textContent;
        const isNumeric = !isNaN(parseInt(finalValue));
        
        if (isNumeric) {
            const target = parseInt(finalValue);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 30);
        }
    });
}

// Update psychology metrics
function updatePsychologyMetrics() {
    const mentalLoadMeter = document.getElementById('mentalLoadMeter');
    if (mentalLoadMeter) {
        const currentLoad = calculateCognitiveLoad();
        mentalLoadMeter.textContent = Math.round(currentLoad) + '%';
        
        // Update color based on cognitive load
        const loadElement = mentalLoadMeter.parentElement;
        if (loadElement) {
            loadElement.className = loadElement.className.replace(/cognitive-load-\w+/, '');
            if (currentLoad < 40) {
                loadElement.classList.add('cognitive-load-low');
            } else if (currentLoad < 70) {
                loadElement.classList.add('cognitive-load-medium');
            } else {
                loadElement.classList.add('cognitive-load-high');
            }
        }
    }
}

// Calculate cognitive load based on user behavior
function calculateCognitiveLoad() {
    const scrollSpeed = getScrollSpeed();
    const interactionFrequency = getInteractionFrequency();
    const timeOnPage = (Date.now() - sessionStartTime) / 1000;
    
    // Psychology-based formula for cognitive load
    let cognitiveLoad = 30; // Base load
    
    // Increase load with rapid scrolling
    if (scrollSpeed > 500) cognitiveLoad += 20;
    
    // Increase load with high interaction frequency
    if (interactionFrequency > 2) cognitiveLoad += 15;
    
    // Decrease load over time (learning effect)
    if (timeOnPage > 60) cognitiveLoad -= 10;
    
    return Math.max(0, Math.min(100, cognitiveLoad));
}

// Track scroll speed for attention analysis
let lastScrollTime = Date.now();
let lastScrollPosition = window.scrollY;
let scrollSpeed = 0;

function getScrollSpeed() {
    return scrollSpeed;
}

window.addEventListener('scroll', function() {
    const currentTime = Date.now();
    const currentPosition = window.scrollY;
    const timeDelta = currentTime - lastScrollTime;
    const positionDelta = Math.abs(currentPosition - lastScrollPosition);
    
    if (timeDelta > 0) {
        scrollSpeed = positionDelta / timeDelta * 1000; // pixels per second
    }
    
    lastScrollTime = currentTime;
    lastScrollPosition = currentPosition;
});

// Track interaction frequency
let recentInteractions = [];

function getInteractionFrequency() {
    const now = Date.now();
    const fiveSecondsAgo = now - 5000;
    
    // Filter interactions from last 5 seconds
    recentInteractions = recentInteractions.filter(time => time > fiveSecondsAgo);
    
    return recentInteractions.length / 5; // interactions per second
}

// Update background mood based on user behavior
function updateBackgroundMood() {
    const body = document.body;
    const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // Change background based on scroll progress
    if (scrollPercentage < 25) {
        body.style.setProperty('--dynamic-mood', 'var(--calm-blue)');
    } else if (scrollPercentage < 50) {
        body.style.setProperty('--dynamic-mood', 'var(--creative-purple)');
    } else if (scrollPercentage < 75) {
        body.style.setProperty('--dynamic-mood', 'var(--energetic-pink)');
    } else {
        body.style.setProperty('--dynamic-mood', 'var(--attention-orange)');
    }
}

// Page context updates for psychology tracking
function updatePageContext(sectionId) {
    const contextMap = {
        'home': 'Landing - First Impressions',
        'skills': 'Skills Assessment - Capability Evaluation', 
        'demos': 'Demo Exploration - Technical Interest',
        'about': 'About Reading - Personal Connection'
    };
    
    const context = contextMap[sectionId] || 'Unknown Section';
    
    // Update page title for psychology tracking
    if (sectionId !== 'home') {
        document.title = `${context} | Psychology-Driven Portfolio`;
    } else {
        document.title = 'Psychology-Driven Web Development Portfolio';
    }
    
    // Track section engagement
    trackInteraction('section-view', sectionId);
}

// Interaction tracking function
function trackInteraction(type, data) {
    const interaction = {
        type: type,
        data: data,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
    
    // Store in session storage for demonstration
    const interactions = JSON.parse(sessionStorage.getItem('psychologyInteractions') || '[]');
    interactions.push(interaction);
    
    // Keep only last 50 interactions for memory management
    if (interactions.length > 50) {
        interactions.splice(0, interactions.length - 50);
    }
    
    sessionStorage.setItem('psychologyInteractions', JSON.stringify(interactions));
    
    // Update interaction counter
    recentInteractions.push(Date.now());
    
    // Console log for development (remove in production)
    console.log(`🧠 Psychology tracking: ${type}`, data);
}

// Cognitive load update function
function updateCognitiveLoad(interactionRate) {
    // Update visual indicators based on cognitive load
    const cognitiveIndicators = document.querySelectorAll('.cognitive-load-indicator');
    
    cognitiveIndicators.forEach(indicator => {
        if (interactionRate < 0.5) {
            indicator.className = indicator.className.replace(/load-\w+/, '') + ' load-low';
        } else if (interactionRate < 1.5) {
            indicator.className = indicator.className.replace(/load-\w+/, '') + ' load-medium';
        } else {
            indicator.className = indicator.className.replace(/load-\w+/, '') + ' load-high';
        }
    });
}

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Tab navigation enhancement
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
        trackInteraction('keyboard-navigation', 'tab');
    }
    
    // Arrow key navigation between sections
    if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        navigateToNextSection();
        trackInteraction('keyboard-navigation', 'arrow-down');
    }
    
    if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        navigateToPreviousSection();
        trackInteraction('keyboard-navigation', 'arrow-up');
    }
});

// Remove keyboard navigation class on mouse use
document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Section navigation functions
function navigateToNextSection() {
    const sections = document.querySelectorAll('section[id]');
    const currentSection = getCurrentSection();
    const currentIndex = Array.from(sections).findIndex(section => section.id === currentSection);
    
    if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        nextSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function navigateToPreviousSection() {
    const sections = document.querySelectorAll('section[id]');
    const currentSection = getCurrentSection();
    const currentIndex = Array.from(sections).findIndex(section => section.id === currentSection);
    
    if (currentIndex > 0) {
        const previousSection = sections[currentIndex - 1];
        previousSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    for (let section of sections) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            return section.id;
        }
    }
    
    return sections[0]?.id || 'home';
}

// Performance monitoring for psychological impact
window.addEventListener('load', function() {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Track load time impact on user psychology
    if (loadTime < 1000) {
        trackInteraction('performance', 'fast-load-positive-impact');
    } else if (loadTime < 3000) {
        trackInteraction('performance', 'moderate-load-acceptable');
    } else {
        trackInteraction('performance', 'slow-load-potential-frustration');
    }
    
    console.log(`⚡ Page loaded in ${loadTime}ms - Psychology impact: ${loadTime < 1000 ? 'Positive' : loadTime < 3000 ? 'Neutral' : 'Negative'}`);
});

// Export functions for potential use by other scripts
window.PsychologyNavigation = {
    trackInteraction,
    updateCognitiveLoad,
    calculateCognitiveLoad,
    navigateToNextSection,
    navigateToPreviousSection
};