// responsive-psychology/js/bootstrap-custom.js - Streamlined Bootstrap Enhancements

class BootstrapPsychologyEnhancer {
    constructor(psychologyCore) {
        this.psychologyCore = psychologyCore;
        this.componentInstances = new Map();
        this.enhancementState = new Map();
        this.performanceMetrics = {
            modalLoadTimes: [],
            tabSwitchTimes: [],
            tooltipShowTimes: []
        };
        
        // Bind methods
        this.handleModalShow = this.handleModalShow.bind(this);
        this.handleModalShown = this.handleModalShown.bind(this);
        this.handleTabShow = this.handleTabShow.bind(this);
        this.handleTabShown = this.handleTabShown.bind(this);
    }
    
    // Initialize all Bootstrap enhancements
    initialize() {
        this.enhanceModals();
        this.enhanceTabs();
        this.enhanceAccordions();
        this.enhanceTooltips();
        this.enhanceProgressBars();
        this.enhanceCards();
        this.setupAccessibilityEnhancements();
        this.injectEnhancedStyles();
        
        console.log('🔧 Bootstrap psychology enhancements initialized');
        return this;
    }
    
    // Enhanced Modal Psychology
    enhanceModals() {
        document.addEventListener('show.bs.modal', this.handleModalShow);
        document.addEventListener('shown.bs.modal', this.handleModalShown);
        document.addEventListener('hide.bs.modal', (event) => {
            this.handleModalHide(event);
        });
        document.addEventListener('hidden.bs.modal', (event) => {
            this.handleModalHidden(event);
        });
    }
    
    handleModalShow(event) {
        const modal = event.target;
        const modalId = modal.id;
        const showStartTime = performance.now();
        
        this.enhancementState.set(modalId, {
            showStartTime,
            type: 'modal',
            interactions: 0
        });
        
        modal.style.setProperty('--modal-entrance-duration', '0.4s');
        modal.classList.add('modal-psychology-entrance');
        
        // Update user's stress level slightly (modal attention focus)
        if (this.psychologyCore) {
            const currentStress = this.psychologyCore.mentalState.stress;
            this.psychologyCore.updateMentalState('stress', Math.min(100, currentStress + 5));
        }
        
        console.log(`🪟 Enhanced modal opening: ${modalId}`);
    }
    
    handleModalShown(event) {
        const modal = event.target;
        const modalId = modal.id;
        const state = this.enhancementState.get(modalId);
        
        if (state) {
            const loadTime = performance.now() - state.showStartTime;
            this.performanceMetrics.modalLoadTimes.push(loadTime);
            
            if (loadTime > 500) {
                console.warn(`⚠️ Slow modal load: ${modalId} took ${Math.round(loadTime)}ms`);
            }
        }
        
        this.enhanceModalFocus(modal);
        this.setupModalInteractionTracking(modal);
    }
    
    handleModalHide(event) {
        const modal = event.target;
        const modalId = modal.id;
        
        // Reduce stress level when modal closes
        if (this.psychologyCore) {
            const currentStress = this.psychologyCore.mentalState.stress;
            this.psychologyCore.updateMentalState('stress', Math.max(0, currentStress - 3));
        }
        
        this.analyzeModalEngagement(modalId);
    }
    
    handleModalHidden(event) {
        const modal = event.target;
        const modalId = modal.id;
        
        this.enhancementState.delete(modalId);
        modal.classList.remove('modal-psychology-entrance');
        
        console.log(`🪟 Modal closed and cleaned: ${modalId}`);
    }
    
    enhanceModalFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            setTimeout(() => {
                focusableElements[0].focus();
            }, 300);
        }
        
        this.setupFocusTrap(modal, focusableElements);
    }
    
    setupFocusTrap(modal, focusableElements) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            } else if (e.key === 'Escape') {
                bootstrap.Modal.getInstance(modal)?.hide();
            }
        };
        
        modal.addEventListener('keydown', handleKeyDown);
        modal._psychologyFocusTrap = handleKeyDown;
    }
    
    setupModalInteractionTracking(modal) {
        const modalId = modal.id;
        let interactionCount = 0;
        
        const trackInteraction = (e) => {
            interactionCount++;
            const state = this.enhancementState.get(modalId);
            if (state) {
                state.interactions = interactionCount;
            }
        };
        
        modal.addEventListener('click', trackInteraction);
        modal.addEventListener('input', trackInteraction);
        modal.addEventListener('change', trackInteraction);
        
        modal._psychologyInteractionTracker = trackInteraction;
    }
    
    analyzeModalEngagement(modalId) {
        const state = this.enhancementState.get(modalId);
        if (!state) return;
        
        const duration = performance.now() - state.showStartTime;
        const interactionRate = state.interactions / (duration / 1000);
        
        let engagement = 'low';
        if (interactionRate > 2) {
            engagement = 'high';
        } else if (interactionRate > 0.5) {
            engagement = 'medium';
        }
        
        console.log(`📊 Modal ${modalId} engagement: ${engagement} (${state.interactions} interactions in ${Math.round(duration)}ms)`);
        
        if (this.psychologyCore && engagement === 'high') {
            this.psychologyCore.behaviorData.interactionHistory.push({
                type: 'high_modal_engagement',
                modalId,
                duration,
                interactions: state.interactions,
                timestamp: Date.now()
            });
        }
    }
    
    // Enhanced Tab Psychology
    enhanceTabs() {
        document.addEventListener('show.bs.tab', this.handleTabShow);
        document.addEventListener('shown.bs.tab', this.handleTabShown);
        document.addEventListener('hide.bs.tab', (event) => {
            this.handleTabHide(event);
        });
    }
    
    handleTabShow(event) {
        const tab = event.target;
        const targetPane = event.target.getAttribute('data-bs-target');
        const showStartTime = performance.now();
        
        this.enhancementState.set(targetPane, {
            showStartTime,
            type: 'tab',
            tabElement: tab
        });
        
        // Slight creativity boost when exploring new tabs
        if (this.psychologyCore) {
            const currentCreativity = this.psychologyCore.mentalState.creativity;
            this.psychologyCore.updateMentalState('creativity', Math.min(100, currentCreativity + 2));
        }
    }
    
    handleTabShown(event) {
        const targetPane = event.target.getAttribute('data-bs-target');
        const paneElement = document.querySelector(targetPane);
        const state = this.enhancementState.get(targetPane);
        
        if (state && paneElement) {
            const switchTime = performance.now() - state.showStartTime;
            this.performanceMetrics.tabSwitchTimes.push(switchTime);
            
            paneElement.style.animation = 'fadeInUp 0.4s ease-out';
            
            setTimeout(() => {
                this.ensureTabContentVisible(paneElement);
            }, 100);
            
            this.trackTabPreference(targetPane);
        }
        
        console.log(`📋 Enhanced tab shown: ${targetPane}`);
    }
    
    handleTabHide(event) {
        const targetPane = event.target.getAttribute('data-bs-target');
        this.enhancementState.delete(targetPane);
    }
    
    ensureTabContentVisible(paneElement) {
        const rect = paneElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < 100 || rect.bottom > windowHeight) {
            paneElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    trackTabPreference(tabId) {
        if (!this.psychologyCore) return;
        
        const preferences = this.psychologyCore.behaviorData.tabPreferences || {};
        preferences[tabId] = (preferences[tabId] || 0) + 1;
        this.psychologyCore.behaviorData.tabPreferences = preferences;
        
        if (preferences[tabId] > 3) {
            console.log(`🎯 User shows strong preference for: ${tabId}`);
        }
    }
    
    // Enhanced Accordion Psychology
    enhanceAccordions() {
        document.addEventListener('show.bs.collapse', (event) => {
            this.handleAccordionShow(event);
        });
        
        document.addEventListener('shown.bs.collapse', (event) => {
            this.handleAccordionShown(event);
        });
        
        document.addEventListener('hide.bs.collapse', (event) => {
            this.handleAccordionHide(event);
        });
    }
    
    handleAccordionShow(event) {
        const accordion = event.target.closest('.accordion');
        if (!accordion) return;
        
        // Slight focus boost when exploring accordion content
        if (this.psychologyCore) {
            const currentFocus = this.psychologyCore.mentalState.focus;
            this.psychologyCore.updateMentalState('focus', Math.min(100, currentFocus + 1));
        }
    }
    
    handleAccordionShown(event) {
        const collapseElement = event.target;
        
        setTimeout(() => {
            collapseElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 100);
        
        this.trackAccordionEngagement(collapseElement);
    }
    
    handleAccordionHide(event) {
        console.log('📰 Accordion section closed');
    }
    
    trackAccordionEngagement(element) {
        const accordionBody = element.querySelector('.accordion-body');
        if (!accordionBody) return;
        
        let scrolled = false;
        let timeOpened = Date.now();
        
        const scrollHandler = () => {
            scrolled = true;
            accordionBody.removeEventListener('scroll', scrollHandler);
        };
        
        accordionBody.addEventListener('scroll', scrollHandler);
        
        const trackClosure = () => {
            const timeSpent = Date.now() - timeOpened;
            console.log(`📰 Accordion engagement: ${Math.round(timeSpent / 1000)}s, scrolled: ${scrolled}`);
            
            if (this.psychologyCore && timeSpent > 5000) {
                this.psychologyCore.behaviorData.interactionHistory.push({
                    type: 'deep_accordion_engagement',
                    timeSpent,
                    scrolled,
                    timestamp: Date.now()
                });
            }
        };
        
        element.addEventListener('hide.bs.collapse', trackClosure, { once: true });
    }
    
    // Enhanced Tooltip Psychology
    enhanceTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        
        tooltipTriggerList.forEach((tooltipTriggerEl) => {
            const tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: 'hover focus',
                delay: { show: 300, hide: 100 },
                animation: true,
                customClass: 'psychology-tooltip',
                placement: 'auto'
            });
            
            this.componentInstances.set(tooltipTriggerEl, tooltip);
            
            tooltipTriggerEl.addEventListener('shown.bs.tooltip', () => {
                this.handleTooltipShown(tooltipTriggerEl);
            });
            
            tooltipTriggerEl.addEventListener('hidden.bs.tooltip', () => {
                this.handleTooltipHidden(tooltipTriggerEl);
            });
        });
    }
    
    handleTooltipShown(element) {
        const showTime = performance.now();
        element._tooltipShowTime = showTime;
        
        console.log('💬 Enhanced tooltip shown - user seeking information');
        
        if (this.psychologyCore) {
            this.psychologyCore.behaviorData.interactionHistory.push({
                type: 'tooltip_info_seeking',
                element: element.className,
                timestamp: Date.now()
            });
        }
    }
    
    handleTooltipHidden(element) {
        if (element._tooltipShowTime) {
            const showDuration = performance.now() - element._tooltipShowTime;
            this.performanceMetrics.tooltipShowTimes.push(showDuration);
            
            if (showDuration > 2000) {
                console.log('📚 User spent significant time reading tooltip');
            }
            
            delete element._tooltipShowTime;
        }
    }
    
    // Enhanced Progress Bar Psychology
    enhanceProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach((bar) => {
            this.enhanceProgressBar(bar);
        });
        
        this.setupProgressBarObserver();
    }
    
    enhanceProgressBar(progressBar) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateProgressBar(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(progressBar);
        this.addProgressCompletionEffects(progressBar);
    }
    
    animateProgressBar(progressBar) {
        const targetWidth = progressBar.style.width || progressBar.getAttribute('aria-valuenow') + '%';
        
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            progressBar.style.width = targetWidth;
            
            setTimeout(() => {
                if (parseInt(targetWidth) >= 90) {
                    progressBar.style.animation = 'progressCompletePulse 0.6s ease-out';
                }
            }, 1200);
        }, 100);
    }
    
    addProgressCompletionEffects(progressBar) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-valuenow') {
                    const value = parseInt(progressBar.getAttribute('aria-valuenow'));
                    this.handleProgressChange(progressBar, value);
                }
            });
        });
        
        observer.observe(progressBar, { attributes: true });
        progressBar._progressObserver = observer;
    }
    
    handleProgressChange(progressBar, value) {
        if (value >= 100) {
            this.triggerCompletionFeedback(progressBar);
            
            if (this.psychologyCore) {
                const currentFocus = this.psychologyCore.mentalState.focus;
                this.psychologyCore.updateMentalState('focus', Math.min(100, currentFocus + 3));
            }
        } else if (value >= 75) {
            progressBar.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.5)';
        } else if (value >= 50) {
            progressBar.style.boxShadow = '0 0 8px rgba(245, 158, 11, 0.4)';
        }
    }
    
    triggerCompletionFeedback(progressBar) {
        progressBar.style.animation = 'progressComplete 0.8s ease-out';
        progressBar.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.8)';
        
        setTimeout(() => {
            progressBar.style.transform = 'scaleY(1.1)';
            setTimeout(() => {
                progressBar.style.transform = 'scaleY(1)';
            }, 200);
        }, 300);
        
        console.log('✅ Progress completion feedback triggered');
    }
    
    setupProgressBarObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const progressBars = node.querySelectorAll('.progress-bar');
                        progressBars.forEach(bar => this.enhanceProgressBar(bar));
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Enhanced Card Psychology
    enhanceCards() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card) => {
            this.enhanceCard(card);
        });
    }
    
    enhanceCard(card) {
        card.addEventListener('mouseenter', () => {
            this.handleCardHover(card, true);
        });
        
        card.addEventListener('mouseleave', () => {
            this.handleCardHover(card, false);
        });
        
        card.addEventListener('click', (e) => {
            this.handleCardClick(card, e);
        });
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateCardEntrance(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(card);
    }
    
    handleCardHover(card, isEntering) {
        if (isEntering) {
            card.style.transform = 'translateY(-5px) scale(1.02)';
            card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            if (this.psychologyCore) {
                const currentCreativity = this.psychologyCore.mentalState.creativity;
                this.psychologyCore.updateMentalState('creativity', Math.min(100, currentCreativity + 1));
            }
        } else {
            card.style.transform = 'translateY(0) scale(1)';
        }
    }
    
    handleCardClick(card, event) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
        
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
        
        console.log('🃏 Enhanced card interaction');
    }
    
    animateCardEntrance(card) {
        card.style.animation = 'cardEntranceSlide 0.6s ease-out';
    }
    
    // Setup accessibility enhancements
    setupAccessibilityEnhancements() {
        document.addEventListener('focus', (event) => {
            if (event.target.matches('button, input, select, textarea, [tabindex]')) {
                this.enhanceFocusIndicator(event.target);
            }
        }, true);
        
        document.addEventListener('keydown', (event) => {
            this.handleAccessibilityKeyboard(event);
        });
        
        this.setupScreenReaderAnnouncements();
    }
    
    enhanceFocusIndicator(element) {
        element.style.outline = '3px solid #F97316';
        element.style.outlineOffset = '2px';
        element.style.transition = 'outline 0.2s ease';
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        }, { once: true });
    }
    
    handleAccessibilityKeyboard(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    event.preventDefault();
                    this.navigateToTab(parseInt(event.key) - 1);
                    break;
                case 'm':
                    event.preventDefault();
                    this.openFirstModal();
                    break;
            }
        }
        
        if (event.key === 'Escape') {
            this.closeTopModal();
        }
    }
    
    navigateToTab(index) {
        const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
        if (tabs[index]) {
            tabs[index].click();
            tabs[index].focus();
        }
    }
    
    openFirstModal() {
        const firstModalTrigger = document.querySelector('[data-bs-toggle="modal"]');
        if (firstModalTrigger) {
            firstModalTrigger.click();
        }
    }
    
    closeTopModal() {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            bootstrap.Modal.getInstance(openModal)?.hide();
        }
    }
    
    setupScreenReaderAnnouncements() {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(announcer);
        
        this.screenReaderAnnouncer = announcer;
    }
    
    announceToScreenReader(message) {
        if (this.screenReaderAnnouncer) {
            this.screenReaderAnnouncer.textContent = message;
            setTimeout(() => {
                this.screenReaderAnnouncer.textContent = '';
            }, 1000);
        }
    }
    
    // Performance monitoring
    getPerformanceMetrics() {
        const avgModalLoad = this.performanceMetrics.modalLoadTimes.length > 0 ?
            this.performanceMetrics.modalLoadTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.modalLoadTimes.length : 0;
            
        const avgTabSwitch = this.performanceMetrics.tabSwitchTimes.length > 0 ?
            this.performanceMetrics.tabSwitchTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.tabSwitchTimes.length : 0;
            
        const avgTooltipShow = this.performanceMetrics.tooltipShowTimes.length > 0 ?
            this.performanceMetrics.tooltipShowTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.tooltipShowTimes.length : 0;
        
        return {
            averageModalLoadTime: Math.round(avgModalLoad),
            averageTabSwitchTime: Math.round(avgTabSwitch),
            averageTooltipShowTime: Math.round(avgTooltipShow),
            totalComponentInstances: this.componentInstances.size,
            activeEnhancements: this.enhancementState.size
        };
    }
    
    // Inject enhanced styles
    injectEnhancedStyles() {
        const style = document.createElement('style');
        style.id = 'bootstrap-psychology-enhancements';
        style.textContent = `
            @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
            }
            
            @keyframes progressCompletePulse {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(1.1); }
            }
            
            @keyframes progressComplete {
                0% { transform: scaleX(1); }
                50% { transform: scaleX(1.02); }
                100% { transform: scaleX(1); }
            }
            
            @keyframes cardEntranceSlide {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .modal-psychology-entrance .modal-dialog {
                animation: modalEnhancedEntrance var(--modal-entrance-duration, 0.4s) cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            @keyframes modalEnhancedEntrance {
                from { opacity: 0; transform: scale(0.9) translateY(-30px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .psychology-tooltip .tooltip-inner {
                background: linear-gradient(45deg, #3B82F6, #06B6D4);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                font-weight: 500;
                padding: 8px 12px;
            }
            
            .psychology-tooltip .tooltip-arrow::before {
                border-top-color: #3B82F6;
            }
            
            /* Enhanced focus indicators */
            .bootstrap-psychology-focus {
                outline: 3px solid #F97316 !important;
                outline-offset: 2px !important;
                transition: outline 0.2s ease !important;
            }
            
            /* Card hover enhancements */
            .card-psychology-hover {
                transform: translateY(-5px) scale(1.02);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Clean up all enhancements
    destroy() {
        document.removeEventListener('show.bs.modal', this.handleModalShow);
        document.removeEventListener('shown.bs.modal', this.handleModalShown);
        document.removeEventListener('show.bs.tab', this.handleTabShow);
        document.removeEventListener('shown.bs.tab', this.handleTabShown);
        
        this.componentInstances.forEach((instance, element) => {
            if (instance.dispose) {
                instance.dispose();
            }
        });
        
        document.querySelectorAll('[data-progress-observer]').forEach(element => {
            if (element._progressObserver) {
                element._progressObserver.disconnect();
            }
        });
        
        const style = document.getElementById('bootstrap-psychology-enhancements');
        if (style) {
            style.remove();
        }
        
        if (this.screenReaderAnnouncer) {
            this.screenReaderAnnouncer.remove();
        }
        
        console.log('🔧 Bootstrap psychology enhancements cleaned up');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BootstrapPsychologyEnhancer;
}