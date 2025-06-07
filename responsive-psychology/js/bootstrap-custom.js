// responsive-psychology/js/bootstrap-custom.js - Bootstrap Component Enhancements

class BootstrapPsychologyEnhancements {
    constructor() {
        this.componentInteractions = new Map();
        this.modalInstances = new Map();
        this.tabSwitchTimes = new Map();
        this.accordionStates = new Map();
        
        this.initializeEnhancements();
    }
    
    initializeEnhancements() {
        this.enhanceModals();
        this.enhanceTabs();
        this.enhanceAccordions();
        this.enhanceProgressBars();
        this.enhanceTooltips();
        this.enhanceCarousels();
        this.enhanceOffcanvas();
        this.enhanceDropdowns();
        
        console.log('🔧 Bootstrap psychology enhancements initialized');
    }
    
    enhanceModals() {
        // Track modal interactions for psychology analysis
        document.addEventListener('show.bs.modal', (event) => {
            const modalId = event.target.id;
            const showTime = Date.now();
            
            this.componentInteractions.set(modalId, {
                type: 'modal',
                showTime: showTime,
                focusTime: 0,
                interactionCount: 0
            });
            
            // Add psychological fade-in effect
            event.target.style.animationDuration = '0.5s';
            event.target.style.animationName = 'modalPsychologyFadeIn';
            
            console.log(`🪟 Modal opened: ${modalId} - Psychology tracking started`);
        });
        
        document.addEventListener('shown.bs.modal', (event) => {
            const modal = event.target;
            const modalId = modal.id;
            
            // Focus management for accessibility and psychology
            const firstInput = modal.querySelector('input, button, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
            
            // Track attention on modal content
            this.trackModalAttention(modal);
        });
        
        document.addEventListener('hide.bs.modal', (event) => {
            const modalId = event.target.id;
            const interaction = this.componentInteractions.get(modalId);
            
            if (interaction) {
                const duration = Date.now() - interaction.showTime;
                console.log(`🪟 Modal closed: ${modalId} - Duration: ${duration}ms, Interactions: ${interaction.interactionCount}`);
                
                // Analyze modal engagement
                this.analyzeModalEngagement(modalId, duration, interaction);
            }
        });
        
        // Add custom CSS for modal psychology
        this.addModalPsychologyCSS();
    }
    
    trackModalAttention(modal) {
        const modalId = modal.id;
        let focusTime = 0;
        let lastFocusTime = Date.now();
        
        modal.addEventListener('click', (e) => {
            const interaction = this.componentInteractions.get(modalId);
            if (interaction) {
                interaction.interactionCount++;
            }
        });
        
        modal.addEventListener('focusin', () => {
            lastFocusTime = Date.now();
        });
        
        modal.addEventListener('focusout', () => {
            focusTime += Date.now() - lastFocusTime;
            const interaction = this.componentInteractions.get(modalId);
            if (interaction) {
                interaction.focusTime = focusTime;
            }
        });
    }
    
    analyzeModalEngagement(modalId, duration, interaction) {
        const engagementScore = (interaction.focusTime / duration) * 100;
        const interactionRate = interaction.interactionCount / (duration / 1000);
        
        let engagement = 'low';
        if (engagementScore > 70 && interactionRate > 0.5) {
            engagement = 'high';
        } else if (engagementScore > 40 || interactionRate > 0.2) {
            engagement = 'medium';
        }
        
        // Provide feedback based on engagement
        if (engagement === 'high') {
            this.showPsychologyFeedback('Excellent modal engagement!', 'success');
        } else if (engagement === 'low' && duration > 5000) {
            this.showPsychologyFeedback('Consider simplifying modal content', 'info');
        }
    }
    
    enhanceTabs() {
        document.addEventListener('show.bs.tab', (event) => {
            const tabId = event.target.getAttribute('data-bs-target');
            this.tabSwitchTimes.set(tabId, Date.now());
        });
        
        document.addEventListener('shown.bs.tab', (event) => {
            const tabId = event.target.getAttribute('data-bs-target');
            const tabPane = document.querySelector(tabId);
            
            if (tabPane) {
                // Add entrance animation for psychological appeal
                tabPane.style.animation = 'tabContentSlideIn 0.4s ease-out';
                
                // Track time spent on each tab
                this.trackTabEngagement(tabId);
            }
        });
        
        // Add custom CSS for tab psychology
        this.addTabPsychologyCSS();
    }
    
    trackTabEngagement(tabId) {
        const startTime = this.tabSwitchTimes.get(tabId) || Date.now();
        let engagementScore = 0;
        
        const tabPane = document.querySelector(tabId);
        if (!tabPane) return;
        
        // Track scroll behavior within tab
        tabPane.addEventListener('scroll', () => {
            engagementScore += 1;
        });
        
        // Track clicks within tab
        tabPane.addEventListener('click', () => {
            engagementScore += 2;
        });
        
        // Analyze engagement when leaving tab
        document.addEventListener('show.bs.tab', (event) => {
            const newTabId = event.target.getAttribute('data-bs-target');
            if (newTabId !== tabId && this.tabSwitchTimes.has(tabId)) {
                const timeSpent = Date.now() - startTime;
                console.log(`📋 Tab engagement: ${tabId} - Time: ${timeSpent}ms, Score: ${engagementScore}`);
            }
        });
    }
    
    enhanceAccordions() {
        document.addEventListener('show.bs.collapse', (event) => {
            const accordion = event.target.closest('.accordion');
            if (accordion) {
                const accordionId = accordion.id || 'unknown';
                const itemId = event.target.id;
                
                this.accordionStates.set(itemId, {
                    openTime: Date.now(),
                    scrolled: false,
                    interacted: false
                });
                
                // Add smooth expand animation
                event.target.style.transition = 'all 0.3s ease-out';
            }
        });
        
        document.addEventListener('shown.bs.collapse', (event) => {
            const accordionBody = event.target.querySelector('.accordion-body');
            if (accordionBody) {
                // Track interactions within accordion body
                this.trackAccordionInteraction(event.target.id, accordionBody);
                
                // Smooth scroll to show full content if needed
                setTimeout(() => {
                    event.target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }, 100);
            }
        });
        
        document.addEventListener('hide.bs.collapse', (event) => {
            const itemId = event.target.id;
            const state = this.accordionStates.get(itemId);
            
            if (state) {
                const duration = Date.now() - state.openTime;
                console.log(`📰 Accordion closed: ${itemId} - Duration: ${duration}ms, Engaged: ${state.interacted}`);
            }
        });
    }
    
    trackAccordionInteraction(itemId, accordionBody) {
        const state = this.accordionStates.get(itemId);
        if (!state) return;
        
        accordionBody.addEventListener('scroll', () => {
            state.scrolled = true;
        }, { once: true });
        
        accordionBody.addEventListener('click', () => {
            state.interacted = true;
        });
    }
    
    enhanceProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach((bar) => {
            // Add smooth animation and psychology effects
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.animateProgressBar(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(bar);
        });
    }
    
    animateProgressBar(progressBar) {
        const targetWidth = progressBar.style.width || progressBar.getAttribute('aria-valuenow') + '%';
        
        // Start from 0 and animate to target
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 1.5s ease-out';
        
        setTimeout(() => {
            progressBar.style.width = targetWidth;
            
            // Add pulse effect when complete
            setTimeout(() => {
                progressBar.style.animation = 'progressPulse 0.6s ease-out';
            }, 1500);
        }, 100);
    }
    
    enhanceTooltips() {
        // Custom tooltip behavior for psychology
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        
        tooltipTriggerList.forEach((tooltipTriggerEl) => {
            const tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: 'hover focus',
                delay: { show: 300, hide: 100 },
                animation: true,
                customClass: 'psychology-tooltip'
            });
            
            // Track tooltip interactions
            tooltipTriggerEl.addEventListener('shown.bs.tooltip', () => {
                console.log('💬 Tooltip shown - User seeking additional information');
            });
        });
        
        this.addTooltipPsychologyCSS();
    }
    
    enhanceCarousels() {
        const carousels = document.querySelectorAll('.carousel');
        
        carousels.forEach((carousel) => {
            const carouselInstance = new bootstrap.Carousel(carousel, {
                interval: 5000,
                touch: true,
                pause: 'hover'
            });
            
            // Track carousel engagement
            carousel.addEventListener('slide.bs.carousel', (event) => {
                console.log(`🎠 Carousel slide: ${event.direction} - Slide ${event.to}`);
            });
            
            // Pause on hover for better UX
            carousel.addEventListener('mouseenter', () => {
                carouselInstance.pause();
            });
            
            carousel.addEventListener('mouseleave', () => {
                carouselInstance.cycle();
            });
        });
    }
    
    enhanceOffcanvas() {
        document.addEventListener('show.bs.offcanvas', (event) => {
            const offcanvas = event.target;
            
            // Add slide-in animation psychology
            offcanvas.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            console.log('📱 Offcanvas opened - Mobile-friendly navigation');
        });
        
        document.addEventListener('shown.bs.offcanvas', (event) => {
            // Focus management for accessibility
            const firstFocusable = event.target.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        });
    }
    
    enhanceDropdowns() {
        document.addEventListener('show.bs.dropdown', (event) => {
            const dropdown = event.target.nextElementSibling;
            if (dropdown) {
                // Add smooth dropdown animation
                dropdown.style.animation = 'dropdownSlideDown 0.3s ease-out';
            }
        });
        
        document.addEventListener('shown.bs.dropdown', (event) => {
            // Track dropdown usage patterns
            const trigger = event.target;
            console.log(`📋 Dropdown opened: ${trigger.textContent.trim()}`);
        });
    }
    
    // CSS Injection Methods
    addModalPsychologyCSS() {
        const css = `
            @keyframes modalPsychologyFadeIn {
                from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .modal.fade .modal-dialog {
                transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            .modal.show .modal-dialog {
                animation: modalPsychologyFadeIn 0.5s ease-out;
            }
        `;
        this.injectCSS(css, 'modal-psychology');
    }
    
    addTabPsychologyCSS() {
        const css = `
            @keyframes tabContentSlideIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .tab-pane.active {
                animation: tabContentSlideIn 0.4s ease-out;
            }
        `;
        this.injectCSS(css, 'tab-psychology');
    }
    
    addTooltipPsychologyCSS() {
        const css = `
            .psychology-tooltip .tooltip-inner {
                background: linear-gradient(45deg, var(--hypno-purple), var(--hypno-pink));
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                font-weight: 500;
            }
            
            .psychology-tooltip .tooltip-arrow::before {
                border-top-color: var(--hypno-purple);
            }
            
            @keyframes progressPulse {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(1.1); }
            }
            
            @keyframes dropdownSlideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        this.injectCSS(css, 'tooltip-psychology');
    }
    
    injectCSS(css, id) {
        if (document.getElementById(id)) return;
        
        const style = document.createElement('style');
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    showPsychologyFeedback(message, type = 'info') {
        // Reuse the toast system from psychology-sim.js
        if (window.PsychologyFunctions && window.PsychologyFunctions.showToast) {
            window.PsychologyFunctions.showToast(message, type);
        } else {
            console.log(`📢 Psychology Feedback: ${message}`);
        }
    }
}

// Advanced Bootstrap Component Psychology
class AdvancedBootstrapPsychology {
    constructor() {
        this.componentUsagePatterns = new Map();
        this.userPreferences = this.loadUserPreferences();
        this.adaptiveInterface = true;
    }
    
    trackComponentUsage(componentType, action, metadata = {}) {
        const key = `${componentType}-${action}`;
        const current = this.componentUsagePatterns.get(key) || 0;
        this.componentUsagePatterns.set(key, current + 1);
        
        // Store usage pattern
        const usage = {
            type: componentType,
            action: action,
            count: current + 1,
            timestamp: Date.now(),
            metadata: metadata
        };
        
        this.updateUserPreferences(usage);
        this.adaptInterface();
    }
    
    updateUserPreferences(usage) {
        // Learn from user behavior
        if (usage.type === 'modal' && usage.count > 3) {
            this.userPreferences.preferencesModal = true;
        }
        
        if (usage.type === 'accordion' && usage.count > 5) {
            this.userPreferences.preferencesAccordion = true;
        }
        
        // Save preferences
        this.saveUserPreferences();
    }
    
    adaptInterface() {
        if (!this.adaptiveInterface) return;
        
        // Adapt interface based on usage patterns
        if (this.userPreferences.preferencesModal) {
            // Make modals more prominent
            document.querySelectorAll('[data-bs-toggle="modal"]').forEach(btn => {
                btn.classList.add('btn-outline-primary');
            });
        }
        
        if (this.userPreferences.preferencesAccordion) {
            // Auto-expand frequently used accordions
            document.querySelectorAll('.accordion-button').forEach(btn => {
                if (!btn.classList.contains('collapsed')) {
                    btn.style.background = 'linear-gradient(45deg, var(--hypno-purple), var(--hypno-pink))';
                }
            });
        }
    }
    
    loadUserPreferences() {
        const saved = localStorage.getItem('bootstrapPsychologyPreferences');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to load psychology preferences');
            }
        }
        
        return {
            preferencesModal: false,
            preferencesAccordion: false,
            animationSpeed: 'normal',
            colorScheme: 'default'
        };
    }
    
    saveUserPreferences() {
        try {
            localStorage.setItem('bootstrapPsychologyPreferences', JSON.stringify(this.userPreferences));
        } catch (e) {
            console.warn('Failed to save psychology preferences');
        }
    }
    
    generateUsageReport() {
        const report = {
            totalInteractions: Array.from(this.componentUsagePatterns.values()).reduce((a, b) => a + b, 0),
            mostUsedComponent: this.getMostUsedComponent(),
            preferences: this.userPreferences,
            recommendations: this.generateRecommendations()
        };
        
        console.log('📊 Bootstrap Psychology Usage Report:', report);
        return report;
    }
    
    getMostUsedComponent() {
        let maxUsage = 0;
        let mostUsed = 'none';
        
        for (const [component, count] of this.componentUsagePatterns) {
            if (count > maxUsage) {
                maxUsage = count;
                mostUsed = component;
            }
        }
        
        return { component: mostUsed, usage: maxUsage };
    }