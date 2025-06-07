// responsive-psychology/js/psychology-sim.js - Interactive Psychology Simulations

class PsychologySimulator {
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
            sectionTime: Date.now()
        };
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.startRealTimeMonitoring();
        this.initializeMentalStateControls();
        this.trackUserBehavior();
        
        console.log('🧠 Psychology simulation initialized');
    }
    
    setupEventListeners() {
        // Mental state range inputs
        const focusRange = document.getElementById('focusRange');
        const creativityRange = document.getElementById('creativityRange');
        const stressRange = document.getElementById('stressRange');
        
        if (focusRange) {
            focusRange.addEventListener('input', (e) => {
                this.updateMentalState('focus', parseInt(e.target.value));
            });
        }
        
        if (creativityRange) {
            creativityRange.addEventListener('input', (e) => {
                this.updateMentalState('creativity', parseInt(e.target.value));
            });
        }
        
        if (stressRange) {
            stressRange.addEventListener('input', (e) => {
                this.updateMentalState('stress', parseInt(e.target.value));
            });
        }
        
        // Interaction tracking
        document.addEventListener('click', (e) => {
            this.trackInteraction(e);
            this.updateInteractionCount();
        });
        
        // Tab change tracking
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                this.trackSectionChange(e.target.getAttribute('data-bs-target'));
            });
        });
    }
    
    updateMentalState(aspect, value) {
        this.mentalState[aspect] = value;
        
        // Update progress bars
        const progressBar = document.getElementById(`${aspect}Progress`);
        if (progressBar) {
            progressBar.style.width = value + '%';
            progressBar.setAttribute('aria-valuenow', value);
        }
        
        // Calculate overall mental state
        this.calculateOverallMentalState();
        
        // Update brainwave visualization
        this.updateBrainwaveActivity();
        
        // Track this as an interaction
        this.interactionCount++;
        this.updateInteractionCount();
        
        // Store in local storage for persistence
        localStorage.setItem('psychologyMentalState', JSON.stringify(this.mentalState));
    }
    
    calculateOverallMentalState() {
        const { focus, creativity, stress } = this.mentalState;
        
        // Calculate mental balance (lower stress is better)
        const balance = (focus + creativity + (100 - stress)) / 3;
        
        let state = 'Overwhelmed';
        let badgeClass = 'bg-danger';
        
        if (balance >= 80) {
            state = 'Peak Performance';
            badgeClass = 'bg-success';
        } else if (balance >= 60) {
            state = 'Focused & Creative';
            badgeClass = 'bg-info';
        } else if (balance >= 40) {
            state = 'Balanced';
            badgeClass = 'bg-primary';
        } else if (balance >= 20) {
            state = 'Stressed';
            badgeClass = 'bg-warning';
        }
        
        const mentalStateElement = document.getElementById('mentalState');
        if (mentalStateElement) {
            mentalStateElement.textContent = state;
            mentalStateElement.className = `badge fs-6 ${badgeClass}`;
        }
        
        // Update cognitive load meter
        this.updateCognitiveLoad(balance);
    }
    
    updateCognitiveLoad(balance) {
        const cognitiveLoad = Math.max(0, 100 - balance);
        const loadMeter = document.getElementById('mentalLoadMeter');
        
        if (loadMeter) {
            loadMeter.textContent = Math.round(cognitiveLoad) + '%';
            
            // Update color based on load
            const parent = loadMeter.parentElement;
            if (parent) {
                parent.className = parent.className.replace(/text-\w+/, '');
                if (cognitiveLoad < 30) {
                    parent.classList.add('text-success');
                } else if (cognitiveLoad < 60) {
                    parent.classList.add('text-warning');
                } else {
                    parent.classList.add('text-danger');
                }
            }
        }
    }
    
    updateBrainwaveActivity() {
        const { focus, creativity, stress } = this.mentalState;
        
        // Update brainwave frequency displays
        const alphaValue = document.getElementById('alphaValue');
        const betaValue = document.getElementById('betaValue');
        const thetaValue = document.getElementById('thetaValue');
        const gammaValue = document.getElementById('gammaValue');
        
        if (alphaValue) {
            // Alpha waves (8-13 Hz) - relaxed awareness
            const alpha = 8 + (creativity / 100) * 5;
            alphaValue.textContent = alpha.toFixed(1) + ' Hz';
        }
        
        if (betaValue) {
            // Beta waves (13-30 Hz) - active concentration
            const beta = 13 + (focus / 100) * 17;
            betaValue.textContent = beta.toFixed(1) + ' Hz';
        }
        
        if (thetaValue) {
            // Theta waves (4-8 Hz) - deep relaxation
            const theta = 4 + ((100 - stress) / 100) * 4;
            thetaValue.textContent = theta.toFixed(1) + ' Hz';
        }
        
        if (gammaValue) {
            // Gamma waves (30-100 Hz) - high-level cognitive processing
            const gamma = 30 + ((focus + creativity) / 200) * 70;
            gammaValue.textContent = gamma.toFixed(1) + ' Hz';
        }
    }
    
    trackInteraction(event) {
        const interaction = {
            type: 'click',
            target: event.target.tagName,
            className: event.target.className,
            timestamp: Date.now(),
            coordinates: {
                x: event.clientX,
                y: event.clientY
            }
        };
        
        this.behaviorData.clickPatterns.push(interaction);
        
        // Keep only last 20 interactions for memory management
        if (this.behaviorData.clickPatterns.length > 20) {
            this.behaviorData.clickPatterns.shift();
        }
        
        // Analyze click patterns
        this.analyzeClickPatterns();
    }
    
    analyzeClickPatterns() {
        const patterns = this.behaviorData.clickPatterns;
        if (patterns.length < 2) return;
        
        // Calculate time between clicks
        const lastTwo = patterns.slice(-2);
        const timeDiff = lastTwo[1].timestamp - lastTwo[0].timestamp;
        
        // Determine click type
        let clickType = 'Analyzing...';
        if (timeDiff < 500) {
            clickType = 'Rapid/Exploratory';
        } else if (timeDiff < 2000) {
            clickType = 'Deliberate';
        } else {
            clickType = 'Thoughtful/Careful';
        }
        
        const clickTypeElement = document.getElementById('clickType');
        if (clickTypeElement) {
            clickTypeElement.textContent = clickType;
        }
        
        // Update click pattern progress
        const clickPattern = document.getElementById('clickPattern');
        if (clickPattern) {
            const deliberateRatio = patterns.filter(p => {
                const nextPattern = patterns[patterns.indexOf(p) + 1];
                return nextPattern && (nextPattern.timestamp - p.timestamp) > 1000;
            }).length / patterns.length * 100;
            
            clickPattern.style.width = deliberateRatio + '%';
        }
    }
    
    trackSectionChange(sectionId) {
        const now = Date.now();
        const timeOnPrevious = now - this.behaviorData.sectionTime;
        
        // Update attention span meter
        const attentionSpan = document.getElementById('attentionSpan');
        const timeOnSection = document.getElementById('timeOnSection');
        
        if (attentionSpan && timeOnSection) {
            const attentionScore = Math.min(100, (timeOnPrevious / 1000) * 2); // 2% per second, max 100%
            attentionSpan.style.width = attentionScore + '%';
            timeOnSection.textContent = Math.round(timeOnPrevious / 1000) + 's';
        }
        
        this.behaviorData.sectionTime = now;
    }
    
    updateInteractionCount() {
        const interactionCounter = document.getElementById('interactionCount');
        if (interactionCounter) {
            interactionCounter.textContent = this.interactionCount;
        }
    }
    
    startRealTimeMonitoring() {
        // Update brainwave visualization every 2 seconds
        setInterval(() => {
            this.simulateBrainwaveFluctuation();
        }, 2000);
        
        // Update component count animation
        setInterval(() => {
            this.updateComponentCount();
        }, 5000);
    }
    
    simulateBrainwaveFluctuation() {
        // Add small random fluctuations to make it feel alive
        const alphaElement = document.getElementById('alphaValue');
        const betaElement = document.getElementById('betaValue');
        const thetaElement = document.getElementById('thetaValue');
        const gammaElement = document.getElementById('gammaValue');
        
        if (alphaElement) {
            const current = parseFloat(alphaElement.textContent);
            const fluctuation = (Math.random() - 0.5) * 0.5;
            alphaElement.textContent = (current + fluctuation).toFixed(1) + ' Hz';
        }
        
        if (betaElement) {
            const current = parseFloat(betaElement.textContent);
            const fluctuation = (Math.random() - 0.5) * 1.0;
            betaElement.textContent = (current + fluctuation).toFixed(1) + ' Hz';
        }
        
        if (thetaElement) {
            const current = parseFloat(thetaElement.textContent);
            const fluctuation = (Math.random() - 0.5) * 0.3;
            thetaElement.textContent = (current + fluctuation).toFixed(1) + ' Hz';
        }
        
        if (gammaElement) {
            const current = parseFloat(gammaElement.textContent);
            const fluctuation = (Math.random() - 0.5) * 2.0;
            gammaElement.textContent = (current + fluctuation).toFixed(1) + ' Hz';
        }
    }
    
    updateComponentCount() {
        const componentCount = document.getElementById('componentCount');
        if (componentCount) {
            // Simulate discovery of more Bootstrap components
            const current = parseInt(componentCount.textContent);
            if (current < 24) {
                componentCount.textContent = current + 1;
            }
        }
    }
    
    initializeMentalStateControls() {
        // Load saved mental state if available
        const saved = localStorage.getItem('psychologyMentalState');
        if (saved) {
            this.mentalState = JSON.parse(saved);
            
            // Update UI elements
            Object.keys(this.mentalState).forEach(key => {
                const range = document.getElementById(`${key}Range`);
                if (range) {
                    range.value = this.mentalState[key];
                    this.updateMentalState(key, this.mentalState[key]);
                }
            });
        } else {
            // Initialize with default values
            Object.keys(this.mentalState).forEach(key => {
                this.updateMentalState(key, this.mentalState[key]);
            });
        }
    }
    
    trackUserBehavior() {
        // Track mouse movement for attention analysis
        let mouseMovements = [];
        
        document.addEventListener('mousemove', (e) => {
            mouseMovements.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            });
            
            // Keep only last 10 movements
            if (mouseMovements.length > 10) {
                mouseMovements.shift();
            }
        });
        
        // Track scroll behavior
        let lastScrollTime = Date.now();
        let scrollDistance = 0;
        
        window.addEventListener('scroll', () => {
            const now = Date.now();
            const timeDiff = now - lastScrollTime;
            
            if (timeDiff > 100) { // Throttle to every 100ms
                scrollDistance += Math.abs(window.scrollY - (scrollDistance || 0));
                lastScrollTime = now;
                
                // Update attention based on scroll behavior
                this.updateAttentionFromScrolling(timeDiff);
            }
        });
    }
    
    updateAttentionFromScrolling(timeDiff) {
        // Slow scrolling indicates reading/attention
        // Fast scrolling indicates skimming/searching
        const scrollSpeed = scrollDistance / timeDiff;
        
        if (scrollSpeed < 0.5) {
            // Slow scroll = good attention
            this.mentalState.focus = Math.min(100, this.mentalState.focus + 1);
        } else if (scrollSpeed > 2) {
            // Fast scroll = distraction
            this.mentalState.stress = Math.min(100, this.mentalState.stress + 1);
        }
        
        // Update displays without triggering events
        this.calculateOverallMentalState();
    }
}

// Psychology Test Functions
function startReactionTest() {
    const simulationArea = document.getElementById('simulationArea');
    simulationArea.classList.add('active');
    
    let reactionTimes = [];
    let testCount = 0;
    const maxTests = 5;
    
    function runSingleTest() {
        if (testCount >= maxTests) {
            completeReactionTest(reactionTimes);
            return;
        }
        
        const delay = 2000 + Math.random() * 3000; // Random delay 2-5 seconds
        
        simulationArea.innerHTML = `
            <div class="text-center">
                <h5>Get Ready...</h5>
                <p>Click when the circle appears!</p>
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const startTime = Date.now();
            simulationArea.innerHTML = `
                <div class="text-center">
                    <div style="width: 100px; height: 100px; background: linear-gradient(45deg, #EC4899, #F97316); 
                                border-radius: 50%; margin: 0 auto; cursor: pointer;" 
                         onclick="recordReaction(${startTime})"></div>
                    <h5 class="mt-3">CLICK NOW!</h5>
                </div>
            `;
        }, delay);
        
        testCount++;
    }
    
    window.recordReaction = function(startTime) {
        const reactionTime = Date.now() - startTime;
        reactionTimes.push(reactionTime);
        
        simulationArea.innerHTML = `
            <div class="text-center">
                <h5>Reaction Time: ${reactionTime}ms</h5>
                <p>Test ${testCount} of ${maxTests}</p>
                <button class="btn btn-primary" onclick="continueReactionTest()">Next Test</button>
            </div>
        `;
    };
    
    window.continueReactionTest = function() {
        runSingleTest();
    };
    
    function completeReactionTest(times) {
        const average = times.reduce((a, b) => a + b, 0) / times.length;
        const avgReaction = document.getElementById('avgReaction');
        const reactionProgress = document.getElementById('reactionProgress');
        
        if (avgReaction) avgReaction.textContent = Math.round(average) + 'ms';
        if (reactionProgress) {
            // Scale: 150ms = 100%, 400ms = 0%
            const percentage = Math.max(0, Math.min(100, (400 - average) / 250 * 100));
            reactionProgress.style.width = percentage + '%';
        }
        
        simulationArea.innerHTML = `
            <div class="text-center">
                <h4>Reaction Test Complete!</h4>
                <p>Average: ${Math.round(average)}ms</p>
                <small class="text-muted">
                    ${average < 200 ? 'Excellent reflexes!' : 
                      average < 300 ? 'Good reaction time!' : 
                      'Room for improvement!'}
                </small>
            </div>
        `;
        
        updateOverallProfile();
    }
    
    runSingleTest();
}

function startMemoryTest() {
    const simulationArea = document.getElementById('simulationArea');
    simulationArea.classList.add('active');
    
    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#F97316', '#10B981', '#EF4444'];
    const sequence = [];
    let userSequence = [];
    let round = 1;
    const maxRounds = 7;
    
    function addToSequence() {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(randomColor);
    }
    
    function showSequence() {
        simulationArea.innerHTML = `
            <div class="text-center">
                <h5>Round ${round} - Watch the sequence</h5>
                <div id="memoryGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); 
                                            gap: 10px; width: 200px; margin: 20px auto;"></div>
            </div>
        `;
        
        const grid = document.getElementById('memoryGrid');
        colors.forEach((color, index) => {
            const cell = document.createElement('div');
            cell.style.cssText = `
                width: 60px; height: 60px; background: #333; border-radius: 10px; 
                cursor: pointer; transition: all 0.3s ease;
            `;
            cell.onclick = () => handleMemoryClick(color);
            grid.appendChild(cell);
        });
        
        // Show sequence
        let sequenceIndex = 0;
        const interval = setInterval(() => {
            if (sequenceIndex < sequence.length) {
                // Highlight current color
                const cells = grid.children;
                for (let i = 0; i < cells.length; i++) {
                    if (colors[i] === sequence[sequenceIndex]) {
                        cells[i].style.background = colors[i];
                        setTimeout(() => {
                            cells[i].style.background = '#333';
                        }, 600);
                        break;
                    }
                }
                sequenceIndex++;
            } else {
                clearInterval(interval);
                startUserInput();
            }
        }, 800);
    }
    
    function startUserInput() {
        simulationArea.querySelector('h5').textContent = 'Your turn - repeat the sequence';
        userSequence = [];
    }
    
    window.handleMemoryClick = function(color) {
        userSequence.push(color);
        
        if (userSequence.length === sequence.length) {
            checkMemorySequence();
        }
    };
    
    function checkMemorySequence() {
        const correct = userSequence.every((color, index) => color === sequence[index]);
        
        if (correct && round < maxRounds) {
            round++;
            addToSequence();
            setTimeout(showSequence, 1000);
        } else {
            completeMemoryTest(correct ? round : round - 1);
        }
    }
    
    function completeMemoryTest(score) {
        const percentage = (score / maxRounds) * 100;
        const memoryScore = document.getElementById('memoryScore');
        const memoryProgress = document.getElementById('memoryProgress');
        
        if (memoryScore) memoryScore.textContent = Math.round(percentage) + '%';
        if (memoryProgress) memoryProgress.style.width = percentage + '%';
        
        simulationArea.innerHTML = `
            <div class="text-center">
                <h4>Memory Test Complete!</h4>
                <p>Score: ${score}/${maxRounds} rounds</p>
                <small class="text-muted">
                    ${percentage >= 80 ? 'Excellent memory!' : 
                      percentage >= 60 ? 'Good recall ability!' : 
                      'Keep practicing!'}
                </small>
            </div>
        `;
        
        updateOverallProfile();
    }
    
    addToSequence();
    showSequence();
}

function startColorTest() {
    const simulationArea = document.getElementById('simulationArea');
    simulationArea.classList.add('active');
    
    let correct = 0;
    let total = 0;
    const maxTests = 8;
    
    function showColorTest() {
        if (total >= maxTests) {
            completeColorTest();
            return;
        }
        
        const baseColor = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
        const difference = 15 + Math.random() * 20; // Subtle difference
        
        const color1 = `rgb(${Math.round(baseColor[0])}, ${Math.round(baseColor[1])}, ${Math.round(baseColor[2])})`;
        const color2 = `rgb(${Math.round(baseColor[0] + difference)}, ${Math.round(baseColor[1])}, ${Math.round(baseColor[2])})`;
        
        const colors = Math.random() > 0.5 ? [color1, color2] : [color2, color1];
        const differentIndex = colors[0] === color1 ? (color1 === color2 ? -1 : 0) : 1;
        
        simulationArea.innerHTML = `
            <div class="text-center">
                <h5>Color Perception Test ${total + 1}/${maxTests}</h5>
                <p>Click the different color</p>
                <div style="display: flex; gap: 20px; justify-content: center; margin: 20px 0;">
                    <div style="width: 100px; height: 100px; background: ${colors[0]}; 
                                border-radius: 10px; cursor: pointer; border: 3px solid white;"
                         onclick="checkColorChoice(${differentIndex === 0})"></div>
                    <div style="width: 100px; height: 100px; background: ${colors[1]}; 
                                border-radius: 10px; cursor: pointer; border: 3px solid white;"
                         onclick="checkColorChoice(${differentIndex === 1})"></div>
                </div>
            </div>
        `;
        
        total++;
    }
    
    window.checkColorChoice = function(isCorrect) {
        if (isCorrect) correct++;
        
        setTimeout(showColorTest, 500);
    };
    
    function completeColorTest() {
        const percentage = (correct / total) * 100;
        const colorScore = document.getElementById('colorScore');
        const colorProgress = document.getElementById('colorProgress');
        
        if (colorScore) colorScore.textContent = Math.round(percentage) + '%';
        if (colorProgress) colorProgress.style.width = percentage + '%';
        
        simulationArea.innerHTML = `
            <div class="text-center">
                <h4>Color Test Complete!</h4>
                <p>Accuracy: ${correct}/${total} (${Math.round(percentage)}%)</p>
                <small class="text-muted">
                    ${percentage >= 80 ? 'Excellent color sensitivity!' : 
                      percentage >= 60 ? 'Good color perception!' : 
                      'Average color detection!'}
                </small>
            </div>
        `;
        
        updateOverallProfile();
    }
    
    showColorTest();
}

function resetSimulations() {
    const simulationArea = document.getElementById('simulationArea');
    simulationArea.classList.remove('active');
    simulationArea.innerHTML = `
        <div class="text-center p-5">
            <i class="fas fa-play-circle fa-3x text-muted mb-3"></i>
            <h5>Select a psychology simulation to begin</h5>
            <p class="text-muted">Each test demonstrates different aspects of human cognition and perception</p>
        </div>
    `;
    
    // Reset all scores
    document.getElementById('avgReaction').textContent = '--ms';
    document.getElementById('memoryScore').textContent = '--%';
    document.getElementById('colorScore').textContent = '--';
    
    document.getElementById('reactionProgress').style.width = '0%';
    document.getElementById('memoryProgress').style.width = '0%';
    document.getElementById('colorProgress').style.width = '0%';
    
    document.getElementById('profileBadge').textContent = 'Baseline';
    document.getElementById('profileBadge').className = 'badge bg-primary';
}

function updateOverallProfile() {
    const reactionText = document.getElementById('avgReaction').textContent;
    const memoryText = document.getElementById('memoryScore').textContent;
    const colorText = document.getElementById('colorScore').textContent;
    
    const hasReaction = reactionText !== '--ms';
    const hasMemory = memoryText !== '--%';
    const hasColor = colorText !== '--';
    
    let profile = 'Baseline';
    let badgeClass = 'bg-primary';
    
    if (hasReaction && hasMemory && hasColor) {
        const reactionMs = parseInt(reactionText);
        const memoryPct = parseInt(memoryText);
        const colorPct = parseInt(colorText);
        
        const overallScore = (
            (reactionMs < 250 ? 100 : Math.max(0, (400 - reactionMs) / 150 * 100)) +
            memoryPct +
            colorPct
        ) / 3;
        
        if (overallScore >= 85) {
            profile = 'Cognitive Elite';
            badgeClass = 'bg-success';
        } else if (overallScore >= 70) {
            profile = 'Sharp Mind';
            badgeClass = 'bg-info';
        } else if (overallScore >= 55) {
            profile = 'Balanced Cognition';
            badgeClass = 'bg-warning';
        } else {
            profile = 'Developing Skills';
            badgeClass = 'bg-secondary';
        }
    }
    
    const profileBadge = document.getElementById('profileBadge');
    profileBadge.textContent = profile;
    profileBadge.className = `badge ${badgeClass}`;
}

// Grid Animation Function
function animateGrid() {
    const gridItems = document.querySelectorAll('.grid-item');
    
    gridItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'scale(1.1) rotate(5deg)';
            item.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            
            setTimeout(() => {
                item.style.transform = 'scale(1) rotate(0deg)';
                item.style.background = 'linear-gradient(45deg, var(--hypno-blue), var(--hypno-purple))';
            }, 300);
        }, index * 100);
    });
    
    // Show toast notification
    showToast('Neural pathways reorganized!', 'success');
}

// Color Psychology Demonstration
function demonstrateColorPsychology() {
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const body = document.body;
    
    colorSwatches.forEach((swatch, index) => {
        setTimeout(() => {
            // Temporarily change body background to demonstrate color impact
            const swatchColor = window.getComputedStyle(swatch).backgroundColor;
            body.style.filter = `hue-rotate(${index * 60}deg)`;
            
            // Add glow effect to current swatch
            swatch.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
            swatch.style.transform = 'scale(1.3)';
            
            setTimeout(() => {
                swatch.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                swatch.style.transform = 'scale(1)';
            }, 800);
        }, index * 1000);
    });
    
    // Reset body filter after demonstration
    setTimeout(() => {
        body.style.filter = 'none';
        showToast('Color psychology demonstration complete!', 'info');
    }, colorSwatches.length * 1000);
}

// Toast Notification System
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const bgClass = {
        success: 'bg-success',
        info: 'bg-info', 
        warning: 'bg-warning',
        danger: 'bg-danger'
    }[type] || 'bg-info';
    
    const toastHTML = `
        <div class="toast align-items-center text-white border-0 ${bgClass}" role="alert" id="${toastId}">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-brain me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.innerHTML = toastHTML;
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Initialize Psychology Simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main psychology simulator
    window.psychologySimulator = new PsychologySimulator();
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Add smooth scrolling behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Initialize performance monitoring
    monitorPerformance();
    
    console.log('🧠 Bootstrap Psychology interface fully initialized');
    console.log('📊 Real-time psychology tracking active');
    console.log('🎯 Interactive simulations ready');
});

// Performance Monitoring for Psychology Impact
function monitorPerformance() {
    // Track page load performance
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        let psychologyImpact = 'neutral';
        if (loadTime < 1000) {
            psychologyImpact = 'positive';
            showToast('Fast load time - positive user experience!', 'success');
        } else if (loadTime < 3000) {
            psychologyImpact = 'acceptable';
        } else {
            psychologyImpact = 'negative';
            showToast('Slow load detected - may impact user psychology', 'warning');
        }
        
        console.log(`⚡ Page loaded in ${loadTime}ms - Psychology impact: ${psychologyImpact}`);
        
        // Track this performance metric
        if (window.psychologySimulator) {
            window.psychologySimulator.trackInteraction('performance-load', {
                loadTime: loadTime,
                impact: psychologyImpact
            });
        }
    });
    
    // Monitor frame rate for smooth animations
    let frameCount = 0;
    let lastFrameTime = performance.now();
    
    function checkFrameRate() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastFrameTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
            
            if (fps < 30) {
                console.warn(`⚠️ Low frame rate detected: ${fps}fps - may impact psychology`);
            }
            
            frameCount = 0;
            lastFrameTime = currentTime;
        }
        
        requestAnimationFrame(checkFrameRate);
    }
    
    requestAnimationFrame(checkFrameRate);
}

// Export functions for global access
window.PsychologyFunctions = {
    startReactionTest,
    startMemoryTest,
    startColorTest,
    resetSimulations,
    animateGrid,
    demonstrateColorPsychology,
    showToast
};

// Advanced Psychology Features
class AdvancedPsychologyFeatures {
    constructor() {
        this.eyeTrackingSimulation = false;
        this.emotionalStateHistory = [];
        this.cognitivePatterns = new Map();
    }
    
    simulateEyeTracking() {
        // Simulate eye tracking using mouse movements
        let gazePoints = [];
        
        document.addEventListener('mousemove', (e) => {
            gazePoints.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            });
            
            // Keep only recent gaze points
            if (gazePoints.length > 50) {
                gazePoints.shift();
            }
            
            this.analyzeGazePatterns(gazePoints);
        });
    }
    
    analyzeGazePatterns(gazePoints) {
        if (gazePoints.length < 10) return;
        
        // Calculate gaze stability
        const recentPoints = gazePoints.slice(-10);
        const avgX = recentPoints.reduce((sum, p) => sum + p.x, 0) / recentPoints.length;
        const avgY = recentPoints.reduce((sum, p) => sum + p.y, 0) / recentPoints.length;
        
        const variance = recentPoints.reduce((sum, p) => {
            return sum + Math.pow(p.x - avgX, 2) + Math.pow(p.y - avgY, 2);
        }, 0) / recentPoints.length;
        
        // Low variance indicates focused attention
        const focusLevel = Math.max(0, Math.min(100, 100 - (variance / 1000)));
        
        // Update focus in mental state if psychology simulator exists
        if (window.psychologySimulator && focusLevel > 70) {
            window.psychologySimulator.mentalState.focus = Math.min(100, 
                window.psychologySimulator.mentalState.focus + 0.1);
        }
    }
    
    trackEmotionalJourney() {
        // Track emotional state changes over time
        setInterval(() => {
            if (window.psychologySimulator) {
                const currentState = {
                    timestamp: Date.now(),
                    focus: window.psychologySimulator.mentalState.focus,
                    creativity: window.psychologySimulator.mentalState.creativity,
                    stress: window.psychologySimulator.mentalState.stress
                };
                
                this.emotionalStateHistory.push(currentState);
                
                // Keep only last hour of data
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                this.emotionalStateHistory = this.emotionalStateHistory.filter(
                    state => state.timestamp > oneHourAgo
                );
                
                this.detectEmotionalPatterns();
            }
        }, 10000); // Every 10 seconds
    }
    
    detectEmotionalPatterns() {
        if (this.emotionalStateHistory.length < 6) return;
        
        const recent = this.emotionalStateHistory.slice(-6);
        
        // Detect trends
        const focusTrend = this.calculateTrend(recent.map(s => s.focus));
        const stressTrend = this.calculateTrend(recent.map(s => s.stress));
        
        if (focusTrend > 5) {
            console.log('📈 Increasing focus detected - positive engagement pattern');
        } else if (stressTrend > 5) {
            console.log('📉 Increasing stress detected - may need intervention');
            showToast('High stress detected - consider taking a break', 'warning');
        }
    }
    
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        let trend = 0;
        for (let i = 1; i < values.length; i++) {
            trend += values[i] - values[i-1];
        }
        
        return trend / (values.length - 1);
    }
}

// Initialize advanced features
const advancedPsychology = new AdvancedPsychologyFeatures();
advancedPsychology.simulateEyeTracking();
advancedPsychology.trackEmotionalJourney();