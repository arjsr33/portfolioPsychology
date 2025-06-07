// js/navigation.js - Enhanced Navigation and Psychology Interactions

class PsychologyNavigation {
    constructor() {
        this.intersectionObserver = null;
        this.scrollTimeout = null;
        this.interactions = [];
        this.sessionStartTime = Date.now();
        this.currentSection = 'foundation';
        this.scrollPosition = 0;
        
        this.init();
    }
    
    init() {
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupScrollTracking();
        this.setupKeyboardNavigation();
        this.setupInteractionTracking();
        this.setupMotionDemos();
        this.setupProgressiveReveal();
        
        console.log('🧠 Enhanced psychology navigation initialized');
    }
    
    setupSmoothScrolling() {
        // Handle section navigation links
        document.querySelectorAll('.section-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.scrollToSection(targetElement, targetId);
                    this.trackInteraction('section-navigation', targetId);
                }
            });
        });
        
        // Handle hero CTA buttons
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
            if (button.getAttribute('href')?.startsWith('#')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const targetId = button.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        this.scrollToSection(targetElement, targetId);
                        this.trackInteraction('hero-cta', targetId);
                    }
                });
            }
        });
    }
    
    scrollToSection(element, sectionId) {
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        
        // Get the actual position of the section header within the main content
        const sectionHeader = element.querySelector('.section-header') || element;
        const mainContent = element.closest('.main-content');
        
        let targetPosition;
        
        if (mainContent) {
            // Calculate position relative to the main content container
            const mainContentRect = mainContent.getBoundingClientRect();
            const sectionHeaderRect = sectionHeader.getBoundingClientRect();
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Position to show the section header at the top, accounting for navbar and padding
            targetPosition = currentScrollTop + sectionHeaderRect.top - navbarHeight - 40;
        } else {
            // Fallback to traditional calculation
            targetPosition = element.offsetTop - navbarHeight - 40;
        }
        
        // Ensure we don't scroll past the top of the page
        targetPosition = Math.max(0, targetPosition);
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Update URL without triggering page jump
        history.pushState(null, null, '#' + sectionId);
        
        // Update current section
        this.currentSection = sectionId;
        
        // Force update active navigation after scroll completes
        setTimeout(() => {
            this.updateActiveNavigation(sectionId, document.querySelectorAll('.section-nav-link'));
        }, 500);
    }
    
    setupIntersectionObserver() {
        const sections = document.querySelectorAll('.content-section');
        const navLinks = document.querySelectorAll('.section-nav-link');
        
        if (!sections.length || !navLinks.length) return;
        
        this.intersectionObserver = new IntersectionObserver((entries) => {
            let mostVisibleSection = null;
            let maxRatio = 0;
            
            entries.forEach(entry => {
                if (entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    mostVisibleSection = entry.target;
                }
            });
            
            if (mostVisibleSection && maxRatio > 0.2) {
                const sectionId = mostVisibleSection.getAttribute('id');
                this.updateActiveNavigation(sectionId, navLinks);
                this.currentSection = sectionId;
                
                // Track section visibility
                this.trackInteraction('section-view', sectionId);
            }
        }, {
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            rootMargin: '-80px 0px -200px 0px'
        });
        
        sections.forEach(section => {
            this.intersectionObserver.observe(section);
        });
    }
    
    updateActiveNavigation(activeSectionId, navLinks) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === `#${activeSectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    setupScrollTracking() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            
            this.scrollTimeout = setTimeout(() => {
                const currentScrollY = window.scrollY;
                const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
                const scrollSpeed = Math.abs(currentScrollY - lastScrollY);
                
                this.scrollPosition = currentScrollY;
                lastScrollY = currentScrollY;
                
                // Update navbar appearance based on scroll
                this.updateNavbarAppearance(currentScrollY);
                
                // Track scroll behavior for psychology analysis
                this.analyzeScrollBehavior(scrollDirection, scrollSpeed);
                
                // Trigger scroll-based animations
                this.triggerScrollAnimations();
                
            }, 10);
        });
    }
    
    updateNavbarAppearance(scrollY) {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        if (scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.1)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
    }
    
    analyzeScrollBehavior(direction, speed) {
        // Analyze user psychology based on scroll patterns
        let behavior = 'reading';
        
        if (speed > 500) {
            behavior = 'scanning';
        } else if (speed < 50) {
            behavior = 'studying';
        } else if (direction === 'up' && speed > 200) {
            behavior = 'reviewing';
        }
        
        this.trackInteraction('scroll-behavior', {
            direction,
            speed,
            behavior,
            section: this.currentSection
        });
    }
    
    triggerScrollAnimations() {
        // Trigger animations for elements coming into view
        const animatedElements = document.querySelectorAll('.scroll-reveal, .observe-slide, .observe-fade');
        
        animatedElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
                if (element.classList.contains('scroll-reveal')) {
                    element.classList.add('revealed');
                }
                if (element.classList.contains('observe-slide')) {
                    element.classList.add('visible');
                }
                if (element.classList.contains('observe-fade')) {
                    element.classList.add('visible');
                }
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Section navigation with arrow keys
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.navigateToNextSection();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.navigateToPreviousSection();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.navigateToFirstSection();
                        break;
                    case 'End':
                        e.preventDefault();
                        this.navigateToLastSection();
                        break;
                }
            }
            
            // Track keyboard usage for accessibility insights
            this.trackInteraction('keyboard-navigation', e.key);
        });
        
        // Enhanced focus management
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    navigateToNextSection() {
        const sections = ['foundation', 'motion', 'structure', 'influence'];
        const currentIndex = sections.indexOf(this.currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        const nextSection = document.getElementById(sections[nextIndex]);
        
        if (nextSection) {
            this.smoothScrollToSection(nextSection, sections[nextIndex]);
        }
    }
    
    navigateToPreviousSection() {
        const sections = ['foundation', 'motion', 'structure', 'influence'];
        const currentIndex = sections.indexOf(this.currentSection);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
        const prevSection = document.getElementById(sections[prevIndex]);
        
        if (prevSection) {
            this.smoothScrollToSection(prevSection, sections[prevIndex]);
        }
    }
    
    navigateToFirstSection() {
        const firstSection = document.getElementById('foundation');
        if (firstSection) {
            this.smoothScrollToSection(firstSection, 'foundation');
        }
    }
    
    navigateToLastSection() {
        const lastSection = document.getElementById('influence');
        if (lastSection) {
            this.smoothScrollToSection(lastSection, 'influence');
        }
    }
    
    setupInteractionTracking() {
        // Track clicks for psychology analysis
        document.addEventListener('click', (e) => {
            const target = e.target;
            const timestamp = Date.now();
            
            // Determine interaction type
            let interactionType = 'general-click';
            if (target.closest('.motion-demo')) {
                interactionType = 'motion-demo';
            } else if (target.closest('.principle-item')) {
                interactionType = 'principle-exploration';
            } else if (target.closest('.structure-card')) {
                interactionType = 'structure-learning';
            } else if (target.closest('.color-connection')) {
                interactionType = 'color-psychology';
            } else if (target.closest('.skill-card')) {
                interactionType = 'skill-navigation';
            }
            
            this.trackInteraction(interactionType, {
                element: target.tagName,
                className: target.className,
                text: target.textContent?.substring(0, 50) || '',
                timestamp
            });
        });
        
        // Track hover patterns for attention analysis
        this.setupHoverTracking();
        
        // Track form interactions
        this.setupFormTracking();
    }
    
    setupHoverTracking() {
        const interactiveElements = document.querySelectorAll(
            '.motion-demo, .principle-item, .structure-card, .color-connection, .skill-card'
        );
        
        interactiveElements.forEach(element => {
            let hoverStartTime = null;
            
            element.addEventListener('mouseenter', () => {
                hoverStartTime = Date.now();
            });
            
            element.addEventListener('mouseleave', () => {
                if (hoverStartTime) {
                    const hoverDuration = Date.now() - hoverStartTime;
                    
                    if (hoverDuration > 1000) {
                        this.trackInteraction('deep-attention', {
                            element: element.className,
                            duration: hoverDuration
                        });
                    }
                }
            });
        });
    }
    
    setupFormTracking() {
        const formElements = document.querySelectorAll('input, textarea, select');
        
        formElements.forEach(element => {
            element.addEventListener('focus', () => {
                this.trackInteraction('form-focus', element.type || element.tagName);
            });
            
            element.addEventListener('input', () => {
                this.trackInteraction('form-input', element.type || element.tagName);
            });
        });
    }
    
    setupMotionDemos() {
        const motionDemos = document.querySelectorAll('.motion-demo');
        
        motionDemos.forEach(demo => {
            demo.addEventListener('click', () => {
                // Add interaction feedback
                demo.classList.add('micro-bounce');
                setTimeout(() => demo.classList.remove('micro-bounce'), 200);
                
                // Track motion demo interaction
                const motionType = demo.querySelector('h4')?.textContent || 'unknown';
                this.trackInteraction('motion-demo-click', motionType);
                
                // Provide visual feedback
                this.showMotionFeedback(demo);
            });
        });
    }
    
    showMotionFeedback(element) {
        const feedback = document.createElement('div');
        feedback.className = 'motion-feedback';
        feedback.textContent = '✨ Motion psychology activated';
        feedback.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(139, 92, 246, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            animation: fadeInUp 0.3s ease-out forwards;
        `;
        
        element.style.position = 'relative';
        element.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }
    
    setupProgressiveReveal() {
        // Add staggered reveal animations to content sections
        const sections = document.querySelectorAll('.content-section');
        
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.2}s`;
            section.classList.add('fade-in-up');
        });
        
        // Add staggered animations to principle items
        const principleItems = document.querySelectorAll('.principle-item');
        principleItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in-up');
        });
        
        // Add staggered animations to motion demos
        const motionDemos = document.querySelectorAll('.motion-demo');
        motionDemos.forEach((demo, index) => {
            demo.style.animationDelay = `${index * 0.2}s`;
            demo.classList.add('fade-in-up');
        });
    }
    
    trackInteraction(type, data) {
        const interaction = {
            type,
            data,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.sessionStartTime,
            currentSection: this.currentSection,
            scrollPosition: this.scrollPosition,
            userAgent: navigator.userAgent.substring(0, 100),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        this.interactions.push(interaction);
        
        // Keep only last 50 interactions for memory management
        if (this.interactions.length > 50) {
            this.interactions.shift();
        }
        
        // Store in session storage for persistence
        try {
            sessionStorage.setItem('psychologyInteractions', JSON.stringify(this.interactions));
        } catch (e) {
            console.warn('Could not store interactions in session storage');
        }
        
        // Log for development (remove in production)
        console.log(`🧠 Psychology interaction: ${type}`, data);
    }
    
    getInteractionSummary() {
        const summary = {
            totalInteractions: this.interactions.length,
            sessionDuration: Date.now() - this.sessionStartTime,
            mostViewedSection: this.getMostViewedSection(),
            averageTimePerSection: this.getAverageTimePerSection(),
            scrollBehaviorPattern: this.getScrollBehaviorPattern(),
            engagementLevel: this.calculateEngagementLevel()
        };
        
        return summary;
    }
    
    getMostViewedSection() {
        const sectionViews = {};
        this.interactions.filter(i => i.type === 'section-view').forEach(i => {
            sectionViews[i.data] = (sectionViews[i.data] || 0) + 1;
        });
        
        return Object.keys(sectionViews).reduce((a, b) => 
            sectionViews[a] > sectionViews[b] ? a : b, 'foundation'
        );
    }
    
    getAverageTimePerSection() {
        const sectionTimes = {};
        const sectionViews = this.interactions.filter(i => i.type === 'section-view');
        
        for (let i = 0; i < sectionViews.length - 1; i++) {
            const current = sectionViews[i];
            const next = sectionViews[i + 1];
            const timeSpent = next.timestamp - current.timestamp;
            
            if (!sectionTimes[current.data]) {
                sectionTimes[current.data] = [];
            }
            sectionTimes[current.data].push(timeSpent);
        }
        
        const averages = {};
        Object.keys(sectionTimes).forEach(section => {
            const times = sectionTimes[section];
            averages[section] = times.reduce((a, b) => a + b, 0) / times.length;
        });
        
        return averages;
    }
    
    getScrollBehaviorPattern() {
        const scrollBehaviors = this.interactions
            .filter(i => i.type === 'scroll-behavior')
            .map(i => i.data.behavior);
        
        const behaviorCounts = {};
        scrollBehaviors.forEach(behavior => {
            behaviorCounts[behavior] = (behaviorCounts[behavior] || 0) + 1;
        });
        
        return Object.keys(behaviorCounts).reduce((a, b) => 
            behaviorCounts[a] > behaviorCounts[b] ? a : b, 'reading'
        );
    }
    
    calculateEngagementLevel() {
        const sessionDuration = Date.now() - this.sessionStartTime;
        const interactionRate = this.interactions.length / (sessionDuration / 1000);
        const deepAttentionEvents = this.interactions.filter(i => i.type === 'deep-attention').length;
        
        let engagementScore = 0;
        
        // Base score from interaction rate
        if (interactionRate > 0.5) engagementScore += 30;
        else if (interactionRate > 0.2) engagementScore += 20;
        else engagementScore += 10;
        
        // Bonus for deep attention
        engagementScore += deepAttentionEvents * 10;
        
        // Bonus for section exploration
        const uniqueSections = new Set(
            this.interactions
                .filter(i => i.type === 'section-view')
                .map(i => i.data)
        ).size;
        engagementScore += uniqueSections * 15;
        
        // Time-based bonus
        if (sessionDuration > 60000) engagementScore += 20; // 1+ minutes
        if (sessionDuration > 180000) engagementScore += 30; // 3+ minutes
        
        return Math.min(100, engagementScore);
    }
    
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // Clean up event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('click', this.clickHandler);
        window.removeEventListener('scroll', this.scrollHandler);
    }
}

// Performance monitoring for psychology insights
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.metrics = {};
        
        this.init();
    }
    
    init() {
        this.measurePageLoad();
        this.measureInteractionLatency();
        this.measureScrollPerformance();
    }
    
    measurePageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            this.metrics.loadTime = loadTime;
            
            // Psychological impact analysis
            let psychologicalImpact = 'neutral';
            if (loadTime < 1000) {
                psychologicalImpact = 'positive';
            } else if (loadTime > 3000) {
                psychologicalImpact = 'negative';
            }
            
            console.log(`⚡ Page loaded in ${Math.round(loadTime)}ms - Psychology impact: ${psychologicalImpact}`);
        });
    }
    
    measureInteractionLatency() {
        document.addEventListener('click', (e) => {
            const startTime = performance.now();
            
            requestAnimationFrame(() => {
                const latency = performance.now() - startTime;
                if (latency > 16) { // More than one frame
                    console.warn(`⚠️ Interaction latency: ${Math.round(latency)}ms - May impact user experience`);
                }
            });
        });
    }
    
    measureScrollPerformance() {
        let frameCount = 0;
        let lastFrameTime = performance.now();
        
        function checkFrameRate() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastFrameTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
                
                if (fps < 30) {
                    console.warn(`⚠️ Low frame rate detected: ${fps}fps - May impact psychology`);
                }
                
                frameCount = 0;
                lastFrameTime = currentTime;
            }
            
            requestAnimationFrame(checkFrameRate);
        }
        
        requestAnimationFrame(checkFrameRate);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize psychology navigation
    window.psychologyNavigation = new PsychologyNavigation();
    
    // Initialize performance monitoring
    window.performanceMonitor = new PerformanceMonitor();
    
    // Initialize tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
    
    console.log('🎨 Visual Psychology interface fully loaded');
    console.log('🧠 Advanced psychology tracking active');
    console.log('✨ Enhanced user experience optimizations enabled');
});

// Export for potential use by other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PsychologyNavigation, PerformanceMonitor };
}