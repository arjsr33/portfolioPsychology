const runSingleTest = () => {
            if (testCount >= maxTests) {
                this.completeReactionTest(reactionTimes);
                return;
            }
            
            const delay = 2000 + Math.random() * 3000; // 2-5 second delay
            
            simulationArea.innerHTML = `
                <div class="text-center">
                    <h5 class="text-white">Get Ready...</h5>
                    <p class="text-light">Click when the circle appears!</p>
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted mt-2">Test ${testCount + 1} of ${maxTests}</p>
                </div>
            `;
            
            setTimeout(() => {
                const startTime = Date.now();
                simulationArea.innerHTML = `
                    <div class="text-center">
                        <div class="reaction-target" 
                             style="width: 100px; height: 100px; background: linear-gradient(45deg, #6366F1, #06B6D4); 
                                    border-radius: 50%; margin: 0 auto; cursor: pointer; 
                                    transition: all 0.2s ease; border: 3px solid white;
                                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);" 
                             onclick="this.recordReaction(${startTime})"></div>
                        <h5 class="mt-3 text-white">CLICK NOW!</h5>
                    </div>
                `;
                
                // Add the recording method to the target
                const target = simulationArea.querySelector('.reaction-target');
                target.recordReaction = (startTime) => {
                    const reactionTime = Date.now() - startTime;
                    reactionTimes.push(reactionTime);
                    testCount++;
                    
                    // Provide immediate feedback
                    let feedback = '';
                    if (reactionTime < 200) {
                        feedback = 'Excellent reflexes!';
                    } else if (reactionTime < 300) {
                        feedback = 'Good reaction time!';
                    } else if (reactionTime < 400) {
                        feedback = 'Average response.';
                    } else {
                        feedback = 'Take your time next round.';
                    }
                    
                    simulationArea.innerHTML = `
                        <div class="text-center">
                            <div class="mb-3">
                                <i class="fas fa-stopwatch fa-2x text-success mb-2"></i>
                                <h5 class="text-success">${reactionTime}ms</h5>
                                <p class="text-light">${feedback}</p>
                                <small class="text-muted">Test ${testCount} of ${maxTests} complete</small>
                            </div>
                            ${testCount < maxTests ? 
                                '<button class="btn btn-primary" onclick="this.continueTest()">Next Test</button>' :
                                '<div class="spinner-border text-success mt-2"></div><p class="text-light mt-2">Calculating results...</p>'
                            }
                        </div>
                    `;
                    
                    // Add continue method if needed
                    if (testCount < maxTests) {
                        simulationArea.querySelector('button').continueTest = () => {
                            setTimeout(runSingleTest, 1000);
                        };
                    } else {
                        setTimeout(() => this.completeReactionTest(reactionTimes), 2000);
                    }
                };
            }, delay);
        };
        
        runSingleTest();
    }
    
    completeReactionTest(times) {
        const average = times.reduce((a, b) => a + b, 0) / times.length;
        const best = Math.min(...times);
        const worst = Math.max(...times);
        
        // Update UI elements
        const avgReaction = document.getElementById('avgReaction');
        const reactionProgress = document.getElementById('reactionProgress');
        
        if (avgReaction) avgReaction.textContent = Math.round(average) + 'ms';
        if (reactionProgress) {
            const percentage = Math.max(0, Math.min(100, (400 - average) / 250 * 100));
            reactionProgress.style.width = percentage + '%';
        }
        
        // Store results
        this.testResults.reactionTime = average;
        this.testData.set('reaction', {
            average,
            best,
            worst,
            attempts: times,
            timestamp: Date.now()
        });
        
        // Display detailed results
        const simulationArea = document.getElementById('simulationArea');
        simulationArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-trophy fa-2x text-warning mb-3"></i>
                <h4 class="text-success">Reaction Test Complete!</h4>
                <div class="row g-3 mt-3">
                    <div class="col-4">
                        <div class="border rounded p-2">
                            <small class="text-muted">Average</small>
                            <div class="fw-bold text-info">${Math.round(average)}ms</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="border rounded p-2">
                            <small class="text-muted">Best</small>
                            <div class="fw-bold text-success">${best}ms</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="border rounded p-2">
                            <small class="text-muted">Worst</small>
                            <div class="fw-bold text-warning">${worst}ms</div>
                        </div>
                    </div>
                </div>
                <p class="text-light mt-3">${this.getReactionAnalysis(average)}</p>
            </div>
        `;
        
        this.updateOverallProfile();
        this.currentTest = null;
    }
    
    getReactionAnalysis(average) {
        if (average < 200) {
            return "Outstanding! You have exceptional reflexes. This suggests high alertness and quick neural processing.";
        } else if (average < 250) {
            return "Excellent reaction time! You're very responsive and likely have good hand-eye coordination.";
        } else if (average < 300) {
            return "Good reaction time. This is above average and indicates healthy reflexes.";
        } else if (average < 400) {
            return "Average reaction time. Consider activities that challenge your reflexes to improve.";
        } else {
            return "Your reaction time suggests you might benefit from exercises that improve alertness and focus.";
        }
    }
    
    // Memory Test
    startMemoryTest() {
        const simulationArea = document.getElementById('simulationArea');
        simulationArea.classList.add('active');
        this.currentTest = 'memory';
        
        const colors = ['#6366F1', '#06B6D4', '#F59E0B', '#10B981', '#F97316', '#EF4444'];
        const sequence = [];
        let userSequence = [];
        let round = 1;
        const maxRounds = 5;
        let mistakes = 0;
        
        const addToSequence = () => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            sequence.push(randomColor);
        };
        
        const showSequence = () => {
            simulationArea.innerHTML = `
                <div class="text-center">
                    <h5 class="text-white">Round ${round} - Watch the sequence</h5>
                    <p class="text-light">Memorize the order of colors</p>
                    <div id="memoryGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); 
                                                gap: 15px; width: 240px; margin: 20px auto;"></div>
                    <div class="progress mt-3" style="height: 8px;">
                        <div class="progress-bar bg-info" style="width: ${(round / maxRounds) * 100}%"></div>
                    </div>
                </div>
            `;
            
            const grid = document.getElementById('memoryGrid');
            colors.forEach((color, index) => {
                const cell = document.createElement('div');
                cell.style.cssText = `
                    width: 70px; height: 70px; background: #333; border-radius: 12px; 
                    cursor: pointer; transition: all 0.3s ease; border: 2px solid #555;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: bold; color: #888;
                `;
                cell.textContent = index + 1;
                cell.onclick = () => this.handleMemoryClick(color, colors, userSequence, sequence, round, maxRounds);
                grid.appendChild(cell);
            });
            
            // Show sequence with enhanced animation
            let sequenceIndex = 0;
            const showNextColor = () => {
                if (sequenceIndex < sequence.length) {
                    const cells = grid.children;
                    const colorIndex = colors.indexOf(sequence[sequenceIndex]);
                    
                    if (colorIndex !== -1 && cells[colorIndex]) {
                        // Highlight the cell
                        cells[colorIndex].style.background = colors[colorIndex];
                        cells[colorIndex].style.transform = 'scale(1.1)';
                        cells[colorIndex].style.boxShadow = `0 0 20px ${colors[colorIndex]}`;
                        cells[colorIndex].style.color = 'white';
                        
                        setTimeout(() => {
                            cells[colorIndex].style.background = '#333';
                            cells[colorIndex].style.transform = 'scale(1)';
                            cells[colorIndex].style.boxShadow = 'none';
                            cells[colorIndex].style.color = '#888';
                            
                            sequenceIndex++;
                            setTimeout(showNextColor, 200);
                        }, 800);
                    }
                } else {
                    this.startUserInput(round);
                }
            };
            
            setTimeout(showNextColor, 1000);
        };
        
        const startTest = () => {
            addToSequence();
            showSequence();
        };
        
        startTest();
    }
    
    startUserInput(round) {
        const simulationArea = document.getElementById('simulationArea');
        const header = simulationArea.querySelector('h5');
        if (header) {
            header.textContent = `Round ${round} - Your turn!`;
        }
        const subheader = simulationArea.querySelector('p');
        if (subheader) {
            subheader.textContent = 'Click the colors in the correct order';
        }
    }
    
    handleMemoryClick(color, colors, userSequence, sequence, round, maxRounds) {
        userSequence.push(color);
        
        // Visual feedback for click
        const grid = document.getElementById('memoryGrid');
        const colorIndex = colors.indexOf(color);
        const cell = grid.children[colorIndex];
        
        cell.style.background = color;
        cell.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            cell.style.background = '#333';
            cell.style.transform = 'scale(1)';
        }, 200);
        
        // Check if sequence is complete
        if (userSequence.length === sequence.length) {
            this.checkMemorySequence(userSequence, sequence, round, maxRounds);
        }
    }
    
    checkMemorySequence(userSequence, sequence, round, maxRounds) {
        const correct = userSequence.every((color, index) => color === sequence[index]);
        
        if (correct && round < maxRounds) {
            // Success feedback
            const simulationArea = document.getElementById('simulationArea');
            simulationArea.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h5 class="text-success">Perfect! Round ${round} Complete</h5>
                    <p class="text-light">Get ready for round ${round + 1}</p>
                    <div class="spinner-border text-success mt-2"></div>
                </div>
            `;
            
            setTimeout(() => {
                this.continueMemoryTest(sequence, round + 1, maxRounds);
            }, 2000);
        } else {
            this.completeMemoryTest(correct ? round : round - 1, maxRounds);
        }
    }
    
    continueMemoryTest(sequence, round, maxRounds) {
        // Add new color to sequence
        const colors = ['#6366F1', '#06B6D4', '#F59E0B', '#10B981', '#F97316', '#EF4444'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(randomColor);
        
        // Continue with new round
        this.showMemorySequence(sequence, [], round, maxRounds);
    }
    
    showMemorySequence(sequence, userSequence, round, maxRounds) {
        const colors = ['#6366F1', '#06B6D4', '#F59E0B', '#10B981', '#F97316', '#EF4444'];
        const simulationArea = document.getElementById('simulationArea');
        
        simulationArea.innerHTML = `
            <div class="text-center">
                <h5 class="text-white">Round ${round} - Watch the sequence</h5>
                <p class="text-light">Memorize the order of ${sequence.length} colors</p>
                <div id="memoryGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); 
                                            gap: 15px; width: 240px; margin: 20px auto;"></div>
                <div class="progress mt-3" style="height: 8px;">
                    <div class="progress-bar bg-info" style="width: ${(round / maxRounds) * 100}%"></div>
                </div>
            </div>
        `;
        
        const grid = document.getElementById('memoryGrid');
        colors.forEach((color, index) => {
            const cell = document.createElement('div');
            cell.style.cssText = `
                width: 70px; height: 70px; background: #333; border-radius: 12px; 
                cursor: pointer; transition: all 0.3s ease; border: 2px solid #555;
                display: flex; align-items: center; justify-content: center;
                font-weight: bold; color: #888;
            `;
            cell.textContent = index + 1;
            cell.onclick = () => this.handleMemoryClick(color, colors, userSequence, sequence, round, maxRounds);
            grid.appendChild(cell);
        });
        
        // Show sequence
        let sequenceIndex = 0;
        const showNextColor = () => {
            if (sequenceIndex < sequence.length) {
                const cells = grid.children;
                const colorIndex = colors.indexOf(sequence[sequenceIndex]);
                
                if (colorIndex !== -1 && cells[colorIndex]) {
                    cells[colorIndex].style.background = colors[colorIndex];
                    cells[colorIndex].style.transform = 'scale(1.1)';
                    cells[colorIndex].style.boxShadow = `0 0 20px ${colors[colorIndex]}`;
                    cells[colorIndex].style.color = 'white';
                    
                    setTimeout(() => {
                        cells[colorIndex].style.background = '#333';
                        cells[colorIndex].style.transform = 'scale(1)';
                        cells[colorIndex].style.boxShadow = 'none';
                        cells[colorIndex].style.color = '#888';
                        
                        sequenceIndex++;
                        setTimeout(showNextColor, 200);
                    }, 800);
                }
            } else {
                this.startUserInput(round);
            }
        };
        
        setTimeout(showNextColor, 1000);
    }
    
    completeMemoryTest(score, maxRounds) {
        const percentage = (score / maxRounds) * 100;
        
        // Update UI elements
        const memoryScore = document.getElementById('memoryScore');
        const memoryProgress = document.getElementById('memoryProgress');
        
        if (memoryScore) memoryScore.textContent = Math.round(percentage) + '%';
        if (memoryProgress) memoryProgress.style.width = percentage + '%';
        
        // Store results
        this.testResults.memoryScore = percentage;
        this.testData.set('memory', {
            score,
            maxRounds,
            percentage,
            timestamp: Date.now()
        });
        
        // Display results
        const simulationArea = document.getElementById('simulationArea');
        simulationArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-brain fa-2x text-info mb-3"></i>
                <h4 class="text-success">Memory Test Complete!</h4>
                <div class="row g-3 mt-3">
                    <div class="col-6">
                        <div class="border rounded p-2">
                            <small class="text-muted">Rounds Completed</small>
                            <div class="fw-bold text-success">${score}/${maxRounds}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="border rounded p-2">
                            <small class="text-muted">Accuracy</small>
                            <div class="fw-bold text-info">${Math.round(percentage)}%</div>
                        </div>
                    </div>
                </div>
                <p class="text-light mt-3">${this.getMemoryAnalysis(percentage)}</p>
            </div>
        `;
        
        this.updateOverallProfile();
        this.currentTest = null;
    }
    
    getMemoryAnalysis(percentage) {
        if (percentage >= 90) {
            return "Exceptional memory! You have excellent short-term memory and pattern recognition abilities.";
        } else if (percentage >= 70) {
            return "Great memory performance! Your working memory capacity is above average.";
        } else if (percentage >= 50) {
            return "Good memory skills. With practice, you can improve your sequence recall abilities.";
        } else if (percentage >= 30) {
            return "Average memory performance. Consider memory training exercises to enhance recall.";
        } else {
            return "Memory training could be beneficial. Try practicing with shorter sequences first.";
        }
    }
    
    // Color Perception Test
    startColorTest() {
        const simulationArea = document.getElementById('simulationArea');
        simulationArea.classList.add('active');
        this.currentTest = 'color';
        
        let correct = 0;
        let total = 0;
        const maxTests = 5;
        let difficulty = 1;
        
        const showColorTest = () => {
            if (total >= maxTests) {
                this.completeColorTest(correct, total);
                return;
            }
            
            // Increase difficulty as test progresses
            const baseDifference = 20 - (difficulty * 3);
            const difference = Math.max(8, baseDifference + Math.random() * 10);
            
            // Generate base color
            const baseColor = [
                Math.floor(Math.random() * 200) + 55,  // Red
                Math.floor(Math.random() * 200) + 55,  // Green
                Math.floor(Math.random() * 200) + 55   // Blue
            ];
            
            // Create slightly different color
            const colorChannel = Math.floor(Math.random() * 3);
            const differentColor = [...baseColor];
            differentColor[colorChannel] = Math.min(255, differentColor[colorChannel] + difference);
            
            const color1 = `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`;
            const color2 = `rgb(${differentColor[0]}, ${differentColor[1]}, ${differentColor[2]})`;
            
            // Randomly place the different color
            const differentIndex = Math.random() > 0.5 ? 0 : 1;
            const colors = differentIndex === 0 ? [color2, color1] : [color1, color2];
            
            simulationArea.innerHTML = `
                <div class="text-center">
                    <h5 class="text-white">Color Perception Test ${total + 1}/${maxTests}</h5>
                    <p class="text-light">Click the different color</p>
                    <div style="display: flex; gap: 30px; justify-content: center; margin: 30px 0;">
                        <div class="color-test-option" 
                             style="width: 120px; height: 120px; background: ${colors[0]}; 
                                    border-radius: 15px; cursor: pointer; border: 3px solid white;
                                    transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"
                             onclick="this.checkChoice(${differentIndex === 0})"></div>
                        <div class="color-test-option"
                             style="width: 120px; height: 120px; background: ${colors[1]}; 
                                    border-radius: 15px; cursor: pointer; border: 3px solid white;
                                    transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"
                             onclick="this.checkChoice(${differentIndex === 1})"></div>
                    </div>
                    <div class="progress mt-3" style="height: 8px;">
                        <div class="progress-bar bg-info" style="width: ${(total / maxTests) * 100}%"></div>
                    </div>
                    <small class="text-muted">Difficulty Level: ${difficulty}</small>
                </div>
            `;
            
            // Add choice checking method
            const options = simulationArea.querySelectorAll('.color-test-option');
            options.forEach(option => {
                option.checkChoice = (isCorrect) => {
                    total++;
                    
                    // Visual feedback
                    option.style.transform = 'scale(0.95)';
                    option.style.borderColor = isCorrect ? '#10B981' : '#EF4444';
                    
                    if (isCorrect) {
                        correct++;
                        option.style.boxShadow = '0 0 20px #10B981';
                    } else {
                        option.style.boxShadow = '0 0 20px #EF4444';
                    }
                    
                    // Increase difficulty
                    if (total % 2 === 0) difficulty++;
                    
                    setTimeout(() => {
                        showColorTest();
                    }, 1000);
                };
            });
        };
        
        showColorTest();
    }
    
    completeColorTest(correct, total) {
        const percentage = (correct / total) * 100;
        
        // Update UI elements
        const colorScore = document.getElementById('colorScore');
        const colorProgress = document.getElementById('colorProgress');
        
        if (colorScore) colorScore.textContent = Math.round(percentage) + '%';
        if (colorProgress) colorProgress.style.width = percentage + '%';
        
        // Store results
        this.testResults.colorPerception = percentage;
        this.testData.set('color', {
            correct,
            total,
            percentage,
            timestamp: Date.now()
        });
        
        // Display results
        const simulationArea = document.getElementById('simulationArea');
        simulationArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-palette fa-2x text-warning mb-3"></i>
                <h4 class="text-success">Color Test Complete!</h4>
                <div class="row g-3 mt-3">
                    <div class="col-6">
                        <div class="border rounded p-2">
                            <small class="text-muted">Correct</small>
                            <div class="fw-bold text-success">${correct}/${total}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="border rounded p-2">
                            <small class="text-muted">Accuracy</small>
                            <div class="fw-bold text-info">${Math.round(percentage)}%</div>
                        </div>
                    </div>
                </div>
                <p class="text-light mt-3">${this.getColorAnalysis(percentage)}</p>
            </div>
        `;
        
        this.updateOverallProfile();
        this.currentTest = null;
    }
    
    getColorAnalysis(percentage) {
        if (percentage >= 90) {
            return "Outstanding color discrimination! You have exceptional visual perception abilities.";
        } else if (percentage >= 75) {
            return "Excellent color sensitivity! Your visual system processes subtle differences very well.";
        } else if (percentage >= 60) {
            return "Good color perception. You can distinguish most color variations effectively.";
        } else if (percentage >= 40) {
            return "Average color discrimination. This is normal for most people.";
        } else {
            return "Consider having your color vision checked by an eye care professional.";
        }
    }
    
    // Reset all simulations
    resetSimulations() {
        const simulationArea = document.getElementById('simulationArea');
        simulationArea.classList.remove('active');
        simulationArea.innerHTML = `
            <div class="text-center p-5">
                <i class="fas fa-play-circle fa-3x text-muted mb-3"></i>
                <h5 class="text-white">Select a psychology simulation to begin</h5>
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
        
        // Clear stored results
        this.testResults = {
            reactionTime: null,
            memoryScore: null,
            colorPerception: null
        };
        this.testData.clear();
        this.currentTest = null;
        
        this.showToast('All simulations reset', 'info');
    }
    
    // Update overall psychology profile
    updateOverallProfile() {
        const { reactionTime, memoryScore, colorPerception } = this.testResults;
        
        const hasReaction = reactionTime !== null;
        const hasMemory = memoryScore !== null;
        const hasColor = colorPerception !== null;
        
        let profile = 'Baseline';
        let badgeClass = 'bg-primary';
        
        if (hasReaction && hasMemory && hasColor) {
            // Calculate composite score
            const reactionScore = reactionTime < 250 ? 100 : Math.max(0, (400 - reactionTime) / 150 * 100);
            const overallScore = (reactionScore + memoryScore + colorPerception) / 3;
            
            if (overallScore >= 85) {
                profile = 'Cognitive Elite';
                badgeClass = 'bg-success';
            } else if (overallScore >= 70) {
                profile = 'Sharp Mind';
                badgeClass = 'bg-info';
            } else if (overallScore >= 55) {
                profile = 'Balanced Cognition';
                badgeClass = 'bg-warning';
            } else if (overallScore >= 40) {
                profile = 'Developing Skills';
                badgeClass = 'bg-secondary';
            } else {
                profile = 'Needs Practice';
                badgeClass = 'bg-danger';
            }
        } else if (hasReaction || hasMemory || hasColor) {
            profile = 'Partial Assessment';
            badgeClass = 'bg-info';
        }
        
        const profileBadge = document.getElementById('profileBadge');
        profileBadge.textContent = profile;
        profileBadge.className = `badge ${badgeClass}`;
    }
    
    // Grid animation
    animateGrid() {
        const gridItems = document.querySelectorAll('.grid-item');
        
        gridItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'scale(1.1) rotate(5deg)';
                item.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
                
                setTimeout(() => {
                    item.style.transform = 'scale(1) rotate(0deg)';
                    item.style.background = 'linear-gradient(135deg, #6366F1, #06B6D4)';
                }, 300);
            }, index * 100);
        });
        
        this.showToast('Neural pathways reorganized!', 'success');
    }
    
    // Color psychology demonstration
    demonstrateColorPsychology() {
        const colorSwatches = document.querySelectorAll('.color-swatch');
        
        colorSwatches.forEach((swatch, index) => {
            setTimeout(() => {
                swatch.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
                swatch.style.transform = 'scale(1.3)';
                
                setTimeout(() => {
                    swatch.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    swatch.style.transform = 'scale(1)';
                }, 800);
            }, index * 200);
        });
        
        setTimeout(() => {
            this.showToast('Color psychology demonstration complete!', 'info');
        }, colorSwatches.length * 200);
    }
    
    // Toast notification helper
    showToast(message, type = 'info') {
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
                // responsive-psychology/js/test-simulations.js - Interactive Psychology Test Suite

class PsychologyTestSuite {
    constructor() {
        this.testResults = {
            reactionTime: null,
            memoryScore: null,
            colorPerception: null
        };
        this.currentTest = null;
        this.testData = new Map();
    }
    
    // Reaction Time Test
    startReactionTest() {
        const simulationArea = document.getElementById('simulationArea');
        simulationArea.classList.add('active');
        this.currentTest = 'reaction';
        
        let reactionTimes = [];
        let testCount = 0;
        const maxTests = 3;
        
        const runSingleTest = () => {
            if (testCount >= maxTests) {
                this.completeReactionTest(reactionTimes);
                return;
            }
            
            const delay = 2000 + Math.random() * 3000; // 2-5 second delay
            
            simulationArea.innerHTML = `
                <div class="text-center">
                    <h5