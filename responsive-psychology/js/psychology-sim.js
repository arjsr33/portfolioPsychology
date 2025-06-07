// responsive-psychology/js/psychology-sim.js - Core Psychology Simulation Engine

class ResponsivePsychologyCore {
    constructor() {
        this.interactionCount = 0;
        this.sessionStartTime = Date.now();
        this.mentalState = {
            focus: 50,
            creativity: 30,
            stress: 25
        };
        this.testResults = {
            reactionTime: null,
            memoryScore: null,
            colorPerception: null
        };
        this.behaviorData = {
            clickPatterns: [],
            attentionSpan: 0,
            sectionTime: Date.now(),
            scrollBehavior: [],
            interactionHistory: [],
            tabPreferences: {},
            keyboardNavigation: false
        };
        this.brainwaveState = {
            alpha: 8.2,
            beta: 15.4,
            theta: 6.1,
            gamma: 42.3
        };
        
        // Store interval references for proper cleanup
        this.brainwaveInterval = null;
        this.componentInterval = null;
        this.driftInterval = null;
        this.lastScrollY = 0;
        
        // Bind methods to preserve context
        this.handleRangeInput = this.handleRangeInput.bind(this);
        this.handleInteraction = this.handleInteraction.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.updateMentalState = this.updateMentalState.bind(this);
    }
    
    // Initialize the psychology simulator
    initialize() {
        this.setupEventListeners();
        this.startRealTimeMonitoring();
        this.initializeMentalStateControls();
        this.trackUserBehavior();
        
        console.log('🧠 Core psychology simulation engine initialized');
        return this;
    }
    
    // Setup all event listeners for psychology tracking
    setupEventListeners() {
        // Mental state range inputs with delegated event handling
        document.addEventListener('input', (e) => {
            if (e.target.matches('#focusRange, #creativityRange, #stressRange')) {
                const aspect = e.target.id.replace('Range', '');
                this.updateMentalState(aspect, parseInt(e.target.value));
            }
        });
        
        // Global interaction tracking
        document.addEventListener('click', this.handleInteraction);
        
        // Tab change tracking with Bootstrap event delegation
        document.addEventListener('shown.bs.tab', this.handleTabChange);
        
        // Keyboard interaction tracking
        document.addEventListener('keydown', (e) => {
            this.trackKeyboardInteraction(e.key, e.ctrlKey, e.altKey);
        });
    }
    
    // Handle range input changes
    handleRangeInput(event) {
        const aspect = event.target.id.replace('Range', '');
        const value = parseInt(event.target.value);
        this.updateMentalState(aspect, value);
    }
    
    // Handle all click interactions
    handleInteraction(event) {
        this.trackInteraction(event);
        this.updateInteractionCount();
        
        // Special handling for specific elements
        if (event.target.closest('.grid-item')) {
            this.trackGridInteraction(event.target);
        } else if (event.target.closest('.color-swatch')) {
            this.trackColorInteraction(event.target);
        } else if (event.target.closest('[data-bs-toggle="modal"]')) {
            this.trackModalTrigger(event.target);
        }
    }
    
    // Handle Bootstrap tab changes
    handleTabChange(event) {
        const targetId = event.target.getAttribute('data-bs-target');
        this.trackSectionChange(targetId);
        this.updateTabEngagement(targetId);
    }
    
    // Update mental state and trigger UI updates
    updateMentalState(aspect, value) {
        this.mentalState[aspect] = value;
        
        // Update progress bars
        this.updateProgressBar(aspect, value);
        
        // Calculate overall mental state
        this.calculateOverallMentalState();
        
        // Update brainwave visualization
        this.updateBrainwaveActivity();
        
        // Track this as an interaction
        this.interactionCount++;
        this.updateInteractionCount();
        
        // Store behavior data
        this.behaviorData.interactionHistory.push({
            type: 'mental_state_change',
            aspect: aspect,
            value: value,
            timestamp: Date.now()
        });
    }
    
    // Update individual progress bar
    updateProgressBar(aspect, value) {
        const progressBar = document.getElementById(`${aspect}Progress`);
        if (progressBar) {
            progressBar.style.width = value + '%';
            progressBar.setAttribute('aria-valuenow', value);
            
            // Add visual feedback with updated color scheme
            progressBar.style.transition = 'width 0.3s ease, box-shadow 0.3s ease';
            progressBar.style.boxShadow = `0 0 ${value / 10}px rgba(59, 130, 246, 0.5)`;
        }
    }
    
    // Calculate and display overall mental state
    calculateOverallMentalState() {
        const { focus, creativity, stress } = this.mentalState;
        const balance = (focus + creativity + (100 - stress)) / 3;
        
        let state, badgeClass, cognitiveLoad;
        
        if (balance >= 85) {
            state = 'Peak Performance';
            badgeClass = 'badge bg-success';
            cognitiveLoad = 15;
        } else if (balance >= 70) {
            state = 'Flow State';
            badgeClass = 'badge bg-info';
            cognitiveLoad = 25;
        } else if (balance >= 55) {
            state = 'Balanced Focus';
            badgeClass = 'badge badge-enhanced';
            cognitiveLoad = 45;
        } else if (balance >= 40) {
            state = 'Mild Stress';
            badgeClass = 'badge bg-warning';
            cognitiveLoad = 65;
        } else {
            state = 'High Stress';
            badgeClass = 'badge bg-danger';
            cognitiveLoad = 85;
        }
        
        // Update mental state display
        const mentalStateElement = document.getElementById('mentalState');
        if (mentalStateElement) {
            mentalStateElement.textContent = state;
            mentalStateElement.className = badgeClass;
        }
        
        // Update cognitive load meter
        this.updateCognitiveLoad(cognitiveLoad);
    }
    
    // Update cognitive load display
    updateCognitiveLoad(load) {
        const loadMeter = document.getElementById('mentalLoadMeter');
        if (loadMeter) {
            loadMeter.textContent = Math.round(load) + '%';
            
            // Update color based on load with new color scheme
            loadMeter.className = 'metric-number';
            if (load < 30) {
                loadMeter.style.background = 'linear-gradient(135deg, #10B981, #06B6D4)';
            } else if (load < 60) {
                loadMeter.style.background = 'linear-gradient(135deg, #F59E0B, #F97316)';
            } else {
                loadMeter.style.background = 'linear-gradient(135deg, #EF4444, #F59E0B)';
            }
            loadMeter.style.backgroundClip = 'text';
            loadMeter.style.webkitBackgroundClip = 'text';
            loadMeter.style.webkitTextFillColor = 'transparent';
        }
    }
    
    // Update brainwave activity simulation
    updateBrainwaveActivity() {
        const { focus, creativity, stress } = this.mentalState;
        
        // Calculate realistic brainwave frequencies
        this.brainwaveState.alpha = 8 + (creativity / 100) * 5; // 8-13 Hz
        this.brainwaveState.beta = 13 + (focus / 100) * 17;     // 13-30 Hz
        this.brainwaveState.theta = 4 + ((100 - stress) / 100) * 4; // 4-8 Hz
        this.brainwaveState.gamma = 30 + ((focus + creativity) / 200) * 70; // 30-100 Hz
        
        // Update displays
        this.updateBrainwaveDisplays();
    }
    
    // Update brainwave frequency displays
    updateBrainwaveDisplays() {
        const displays = {
            alphaValue: this.brainwaveState.alpha,
            betaValue: this.brainwaveState.beta,
            thetaValue: this.brainwaveState.theta,
            gammaValue: this.brainwaveState.gamma
        };
        
        Object.entries(displays).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toFixed(1) + ' Hz';
            }
        });
    }
    
    // Track user interactions for behavioral analysis
    trackInteraction(event) {
        const interaction = {
            type: 'click',
            target: event.target.tagName,
            className: event.target.className,
            timestamp: Date.now(),
            coordinates: { x: event.clientX, y: event.clientY },
            mentalState: { ...this.mentalState }
        };
        
        this.behaviorData.clickPatterns.push(interaction);
        
        // Maintain reasonable history size
        if (this.behaviorData.clickPatterns.length > 50) {
            this.behaviorData.clickPatterns.shift();
        }
        
        // Analyze patterns in real-time
        this.analyzeClickPatterns();
    }
    
    // Analyze click patterns for psychology insights
    analyzeClickPatterns() {
        const patterns = this.behaviorData.clickPatterns;
        if (patterns.length < 2) return;
        
        const lastTwo = patterns.slice(-2);
        const timeDiff = lastTwo[1].timestamp - lastTwo[0].timestamp;
        
        let clickType = 'Analyzing...';
        let behavior = 'neutral';
        
        if (timeDiff < 300) {
            clickType = 'Rapid/Impulsive';
            behavior = 'high-energy';
        } else if (timeDiff < 1000) {
            clickType = 'Quick/Exploratory';
            behavior = 'engaged';
        } else if (timeDiff < 3000) {
            clickType = 'Deliberate';
            behavior = 'focused';
        } else {
            clickType = 'Thoughtful/Careful';
            behavior = 'contemplative';
        }
        
        // Update UI
        const clickTypeElement = document.getElementById('clickType');
        if (clickTypeElement) {
            clickTypeElement.textContent = clickType;
        }
        
        // Update click pattern visualization
        this.updateClickPatternVisualization(behavior);
    }
    
    // Update click pattern progress visualization
    updateClickPatternVisualization(behavior) {
        const clickPattern = document.getElementById('clickPattern');
        if (!clickPattern) return;
        
        const patterns = this.behaviorData.clickPatterns;
        const deliberateClicks = patterns.filter((p, index) => {
            const next = patterns[index + 1];
            return next && (next.timestamp - p.timestamp) > 1000;
        });
        
        const deliberateRatio = patterns.length > 0 ? 
            (deliberateClicks.length / patterns.length) * 100 : 0;
        
        clickPattern.style.width = deliberateRatio + '%';
        
        // Change color based on behavior - updated classes
        const colorClasses = {
            'high-energy': 'progress-bar bg-danger',
            'engaged': 'progress-bar bg-warning', 
            'focused': 'progress-bar bg-info',
            'contemplative': 'progress-bar bg-success'
        };
        
        clickPattern.className = colorClasses[behavior] || 'progress-bar bg-primary';
    }
    
    // Track section changes and attention spans
    trackSectionChange(sectionId) {
        const now = Date.now();
        const timeOnPrevious = now - this.behaviorData.sectionTime;
        
        // Update attention span metrics
        const attentionSpan = document.getElementById('attentionSpan');
        const timeOnSection = document.getElementById('timeOnSection');
        
        if (attentionSpan && timeOnSection) {
            const attentionScore = Math.min(100, (timeOnPrevious / 1000) * 1.5);
            attentionSpan.style.width = attentionScore + '%';
            timeOnSection.textContent = Math.round(timeOnPrevious / 1000) + 's';
        }
        
        // Store section engagement data
        this.behaviorData.interactionHistory.push({
            type: 'section_change',
            section: sectionId,
            timeSpent: timeOnPrevious,
            timestamp: now
        });
        
        this.behaviorData.sectionTime = now;
    }
    
    // Track tab engagement patterns
    updateTabEngagement(tabId) {
        const engagement = {
            tab: tabId,
            timestamp: Date.now(),
            mentalState: { ...this.mentalState }
        };
        
        // Track tab preferences
        this.behaviorData.tabPreferences[tabId] = (this.behaviorData.tabPreferences[tabId] || 0) + 1;
        
        // Analyze engagement patterns
        this.analyzeTabEngagement(engagement);
    }
    
    // Analyze tab engagement for user preferences
    analyzeTabEngagement(engagement) {
        // Track which tabs users prefer in different mental states
        const { focus, creativity, stress } = engagement.mentalState;
        
        if (focus > 70 && engagement.tab === '#cognition') {
            console.log('🎯 High focus user engaging with cognitive content');
        } else if (creativity > 60 && engagement.tab === '#perception') {
            console.log('🎨 Creative user exploring visual perception');
        } else if (stress < 30 && engagement.tab === '#behavior') {
            console.log('😌 Relaxed user analyzing behavioral patterns');
        }
    }
    
    // Track keyboard interactions for accessibility insights
    trackKeyboardInteraction(key, ctrlKey, altKey) {
        if (key === 'Tab') {
            this.behaviorData.keyboardNavigation = true;
            document.body.classList.add('keyboard-navigation');
        }
        
        // Track keyboard shortcuts usage
        if (ctrlKey) {
            console.log(`⌨️ Power user: Ctrl+${key}`);
        }
    }
    
    // Track grid interaction patterns
    trackGridInteraction(element) {
        const gridPosition = Array.from(element.parentElement.children).indexOf(element);
        console.log(`🎯 Grid interaction: position ${gridPosition + 1}`);
        
        // Animate the specific grid item
        element.style.transform = 'scale(1.1) rotate(2deg)';
        setTimeout(() => {
            element.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    }
    
    // Track color swatch interactions
    trackColorInteraction(element) {
        const colorValue = window.getComputedStyle(element).backgroundColor;
        console.log(`🎨 Color interaction: ${colorValue}`);
        
        // Provide haptic-like feedback
        element.style.transform = 'scale(1.2)';
        element.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.8)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        }, 300);
    }
    
    // Track modal trigger interactions
    trackModalTrigger(element) {
        const modalTarget = element.getAttribute('data-bs-target');
        console.log(`🪟 Modal trigger: ${modalTarget}`);
        
        this.behaviorData.interactionHistory.push({
            type: 'modal_trigger',
            target: modalTarget,
            timestamp: Date.now()
        });
    }
    
    // Update interaction counter display
    updateInteractionCount() {
        const counter = document.getElementById('interactionCount');
        if (counter) {
            counter.textContent = this.interactionCount;
            
            // Add brief animation
            counter.style.transform = 'scale(1.1)';
            setTimeout(() => {
                counter.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    // Start real-time monitoring systems
    startRealTimeMonitoring() {
        // Brainwave fluctuation simulation
        this.brainwaveInterval = setInterval(() => {
            this.simulateBrainwaveFluctuation();
        }, 2000);
        
        // Component count animation
        this.componentInterval = setInterval(() => {
            this.updateComponentCount();
        }, 5000);
        
        // Mental state drift simulation
        this.driftInterval = setInterval(() => {
            this.simulateNaturalMentalDrift();
        }, 10000);
    }
    
    // Simulate realistic brainwave fluctuations
    simulateBrainwaveFluctuation() {
        const fluctuations = {
            alpha: (Math.random() - 0.5) * 0.3,
            beta: (Math.random() - 0.5) * 0.8,
            theta: (Math.random() - 0.5) * 0.2,
            gamma: (Math.random() - 0.5) * 1.5
        };
        
        Object.entries(fluctuations).forEach(([wave, delta]) => {
            this.brainwaveState[wave] = Math.max(0, this.brainwaveState[wave] + delta);
        });
        
        this.updateBrainwaveDisplays();
    }
    
    // Update component count with animation
    updateComponentCount() {
        const counter = document.getElementById('componentCount');
        if (counter) {
            const current = parseInt(counter.textContent);
            if (current < 24) {
                counter.textContent = current + 1;
                counter.style.background = 'linear-gradient(135deg, #10B981, #06B6D4)';
                counter.style.backgroundClip = 'text';
                counter.style.webkitBackgroundClip = 'text';
                counter.style.webkitTextFillColor = 'transparent';
                
                setTimeout(() => {
                    counter.style.background = 'linear-gradient(135deg, #F97316, #F59E0B)';
                    counter.style.backgroundClip = 'text';
                    counter.style.webkitBackgroundClip = 'text';
                    counter.style.webkitTextFillColor = 'transparent';
                }, 500);
            }
        }
    }
    
    // Simulate natural mental state drift
    simulateNaturalMentalDrift() {
        // Subtle changes that simulate natural mental state fluctuations
        const driftFactors = {
            focus: (Math.random() - 0.5) * 2,
            creativity: (Math.random() - 0.5) * 1.5,
            stress: (Math.random() - 0.5) * 1
        };
        
        let hasChanged = false;
        Object.entries(driftFactors).forEach(([aspect, drift]) => {
            const currentValue = this.mentalState[aspect];
            const newValue = Math.max(0, Math.min(100, currentValue + drift));
            
            if (Math.abs(newValue - currentValue) > 0.5) {
                this.mentalState[aspect] = newValue;
                
                // Update the corresponding range input to reflect drift
                const rangeInput = document.getElementById(`${aspect}Range`);
                if (rangeInput) {
                    rangeInput.value = newValue;
                }
                
                this.updateProgressBar(aspect, newValue);
                hasChanged = true;
            }
        });
        
        if (hasChanged) {
            this.calculateOverallMentalState();
            this.updateBrainwaveActivity();
        }
    }
    
    // Initialize mental state controls
    initializeMentalStateControls() {
        Object.entries(this.mentalState).forEach(([key, value]) => {
            const range = document.getElementById(`${key}Range`);
            if (range) {
                range.value = value;
                this.updateProgressBar(key, value);
            }
        });
        
        this.calculateOverallMentalState();
        this.updateBrainwaveActivity();
    }
    
    // Track comprehensive user behavior
    trackUserBehavior() {
        // Mouse movement patterns (simplified to avoid performance issues)
        let mouseMovements = [];
        document.addEventListener('mousemove', (e) => {
            mouseMovements.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            });
            
            if (mouseMovements.length > 20) {
                mouseMovements.shift();
            }
        });
        
        // Scroll behavior analysis
        let lastScrollTime = Date.now();
        window.addEventListener('scroll', (e) => {
            const now = Date.now();
            const scrollSpeed = Math.abs(window.scrollY - this.lastScrollY);
            const timeDiff = now - lastScrollTime;
            
            if (timeDiff > 100) {
                this.analyzeScrollBehavior(scrollSpeed, timeDiff);
                lastScrollTime = now;
                this.lastScrollY = window.scrollY;
            }
        });
        
        // Focus and blur tracking
        document.addEventListener('focusin', (e) => {
            this.trackFocusEvent('focus', e.target);
        });
        
        document.addEventListener('focusout', (e) => {
            this.trackFocusEvent('blur', e.target);
        });
    }
    
    // Analyze scroll behavior for attention patterns
    analyzeScrollBehavior(speed, timeDiff) {
        let behavior = 'reading';
        
        if (speed > 300 && timeDiff < 100) {
            behavior = 'scanning';
        } else if (speed < 50 && timeDiff > 500) {
            behavior = 'studying';
        } else if (speed > 200) {
            behavior = 'seeking';
        }
        
        this.behaviorData.scrollBehavior.push({
            behavior,
            speed,
            timestamp: Date.now()
        });
        
        // Keep reasonable history
        if (this.behaviorData.scrollBehavior.length > 30) {
            this.behaviorData.scrollBehavior.shift();
        }
    }
    
    // Track focus events for attention analysis
    trackFocusEvent(type, element) {
        const focusData = {
            type,
            element: element.tagName,
            className: element.className,
            timestamp: Date.now()
        };
        
        if (type === 'focus' && element.matches('input, textarea, select')) {
            console.log(`🎯 User focused on: ${element.tagName}`);
        }
    }
    
    // Get comprehensive behavior analysis
    getBehaviorAnalysis() {
        const sessionDuration = Date.now() - this.sessionStartTime;
        const recentClicks = this.behaviorData.clickPatterns.slice(-10);
        const recentScroll = this.behaviorData.scrollBehavior.slice(-10);
        
        return {
            sessionDuration: Math.round(sessionDuration / 1000),
            totalInteractions: this.interactionCount,
            averageClickSpeed: this.calculateAverageClickSpeed(recentClicks),
            dominantScrollBehavior: this.getDominantScrollBehavior(recentScroll),
            mentalStateProgression: this.getMentalStateProgression(),
            engagementLevel: this.calculateEngagementLevel(),
            cognitiveLoad: this.getCurrentCognitiveLoad()
        };
    }
    
    // Calculate average click speed
    calculateAverageClickSpeed(clicks) {
        if (clicks.length < 2) return 0;
        
        const speeds = [];
        for (let i = 1; i < clicks.length; i++) {
            speeds.push(clicks[i].timestamp - clicks[i-1].timestamp);
        }
        
        return speeds.reduce((a, b) => a + b, 0) / speeds.length;
    }
    
    // Get dominant scroll behavior
    getDominantScrollBehavior(scrollData) {
        const behaviors = {};
        scrollData.forEach(s => {
            behaviors[s.behavior] = (behaviors[s.behavior] || 0) + 1;
        });
        
        return Object.keys(behaviors).reduce((a, b) => 
            behaviors[a] > behaviors[b] ? a : b, 'neutral'
        );
    }
    
    // Get mental state progression over time
    getMentalStateProgression() {
        const history = this.behaviorData.interactionHistory
            .filter(h => h.type === 'mental_state_change')
            .slice(-10);
        
        return history.map(h => ({
            aspect: h.aspect,
            value: h.value,
            timestamp: h.timestamp
        }));
    }
    
    // Calculate overall engagement level
    calculateEngagementLevel() {
        const sessionDuration = Date.now() - this.sessionStartTime;
        const interactionRate = this.interactionCount / (sessionDuration / 1000);
        const { focus, creativity, stress } = this.mentalState;
        const mentalBalance = (focus + creativity + (100 - stress)) / 3;
        
        let engagement = 0;
        
        // Base engagement from interaction rate
        if (interactionRate > 0.5) engagement += 40;
        else if (interactionRate > 0.2) engagement += 25;
        else engagement += 10;
        
        // Mental state bonus
        if (mentalBalance > 70) engagement += 30;
        else if (mentalBalance > 50) engagement += 20;
        else engagement += 5;
        
        // Session length bonus
        if (sessionDuration > 60000) engagement += 20; // 1+ minute
        if (sessionDuration > 180000) engagement += 10; // 3+ minutes
        
        return Math.min(100, engagement);
    }
    
    // Get current cognitive load
    getCurrentCognitiveLoad() {
        const { focus, creativity, stress } = this.mentalState;
        const balance = (focus + creativity + (100 - stress)) / 3;
        return Math.max(0, 100 - balance);
    }
    
    // Clean up and destroy instance
    destroy() {
        document.removeEventListener('input', this.handleRangeInput);
        document.removeEventListener('click', this.handleInteraction);
        document.removeEventListener('shown.bs.tab', this.handleTabChange);
        
        // Clear intervals properly
        if (this.brainwaveInterval) clearInterval(this.brainwaveInterval);
        if (this.componentInterval) clearInterval(this.componentInterval);
        if (this.driftInterval) clearInterval(this.driftInterval);
        
        console.log('🧠 Psychology simulation engine destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsivePsychologyCore;
} else {
    window.ResponsivePsychologyCore = ResponsivePsychologyCore;
}