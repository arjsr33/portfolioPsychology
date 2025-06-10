// fullstack-psychology/frontend/src/components/InteractivePsychology.jsx
import React, { useState, useEffect } from 'react';
import { Eye, Brain, Zap, Activity, Timer, Palette, RotateCcw, Play } from 'lucide-react';
import api from '../services/api.js';

const InteractivePsychology = ({ 
  mentalState, 
  onUpdateMentalState, 
  sessionId, 
  isConnected, 
  isMonitoring 
}) => {
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Reaction Time Test State
  const [reactionTest, setReactionTest] = useState({
    attempts: [],
    currentAttempt: 0,
    waiting: false,
    canClick: false,
    startTime: null,
    waitDelay: null
  });

  // Memory Test State
  const [memoryTest, setMemoryTest] = useState({
    sequence: [],
    userSequence: [],
    showing: false,
    currentIndex: 0,
    level: 4
  });

  // Color Test State
  const [colorTest, setColorTest] = useState({
    targetColor: null,
    options: [],
    startTime: null,
    correct: 0,
    total: 0
  });

  // Mental State Controller Component
  const MentalStateController = () => {
    const stateConfig = [
      { key: 'focus', label: 'Focus', color: 'blue', icon: Eye },
      { key: 'creativity', label: 'Creativity', color: 'purple', icon: Brain },
      { key: 'stress', label: 'Stress', color: 'red', icon: Zap },
      { key: 'energy', label: 'Energy', color: 'orange', icon: Activity }
    ];

    const getColorClass = (color) => {
      const colors = {
        blue: '#3B82F6',
        purple: '#8B5CF6',
        red: '#EF4444',
        orange: '#F97316'
      };
      return colors[color];
    };

    const handleSliderChange = (key, value) => {
      onUpdateMentalState({ [key]: parseInt(value) });
    };

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Brain className="mr-2" size={16} />
          Mental State Controller
          <div className={`ml-auto w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
        </h4>
        
        <div className="space-y-4">
          {stateConfig.map(({ key, label, color, icon: Icon }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Icon size={14} className="mr-2 text-gray-400" />
                  <label className="text-gray-300 text-sm font-medium">{label}</label>
                </div>
                <span className="text-white font-mono text-sm">
                  {mentalState[key]}%
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mentalState[key]}
                  onChange={(e) => handleSliderChange(key, e.target.value)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${getColorClass(color)} 0%, ${getColorClass(color)} ${mentalState[key]}%, #374151 ${mentalState[key]}%, #374151 100%)`
                  }}
                  disabled={!isConnected}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Reaction Time Test Functions
  const startReactionTest = () => {
    setActiveTest('reaction');
    setIsRunningTest(true);
    setReactionTest({
      attempts: [],
      currentAttempt: 0,
      waiting: true,
      canClick: false,
      startTime: null,
      waitDelay: 2000 + Math.random() * 3000
    });

    setTimeout(() => {
      setReactionTest(prev => ({
        ...prev,
        waiting: false,
        canClick: true,
        startTime: Date.now()
      }));
    }, 2000 + Math.random() * 3000);
  };

  const handleReactionClick = () => {
    if (!reactionTest.canClick) return;

    const reactionTime = Date.now() - reactionTest.startTime;
    const newAttempts = [...reactionTest.attempts, reactionTime];

    setReactionTest(prev => ({
      ...prev,
      attempts: newAttempts,
      canClick: false,
      currentAttempt: prev.currentAttempt + 1
    }));

    if (newAttempts.length >= 5) {
      finishReactionTest(newAttempts);
    } else {
      // Next attempt
      setTimeout(() => {
        const waitTime = 2000 + Math.random() * 3000;
        setReactionTest(prev => ({
          ...prev,
          waiting: true,
          waitDelay: waitTime
        }));

        setTimeout(() => {
          setReactionTest(prev => ({
            ...prev,
            waiting: false,
            canClick: true,
            startTime: Date.now()
          }));
        }, waitTime);
      }, 1500);
    }
  };

  const finishReactionTest = async (attempts) => {
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    const best = Math.min(...attempts);
    const worst = Math.max(...attempts);
    const variance = attempts.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / attempts.length;
    const consistency = Math.max(0, 1 - (Math.sqrt(variance) / average));

    const results = {
      attempts,
      average: Math.round(average),
      best,
      worst,
      consistency: Math.round(consistency * 100) / 100
    };

    setTestResults(prev => ({ ...prev, reaction: results }));

    if (sessionId && isConnected) {
      try {
        await api.submitReactionTest({
          sessionId,
          results,
          mentalStateAtStart: mentalState,
          mentalStateAtEnd: mentalState
        });
      } catch (error) {
        console.error('Failed to submit reaction test:', error);
      }
    }

    setIsRunningTest(false);
  };

  // Memory Test Functions
  const startMemoryTest = () => {
    setActiveTest('memory');
    setIsRunningTest(true);
    
    const sequence = Array.from({ length: memoryTest.level }, () => Math.floor(Math.random() * 4));
    setMemoryTest(prev => ({
      ...prev,
      sequence,
      userSequence: [],
      showing: true,
      currentIndex: 0
    }));

    // Show sequence
    sequence.forEach((color, index) => {
      setTimeout(() => {
        setMemoryTest(prev => ({ ...prev, currentIndex: index }));
      }, index * 800);
    });

    setTimeout(() => {
      setMemoryTest(prev => ({ ...prev, showing: false }));
    }, sequence.length * 800 + 500);
  };

  const handleMemoryClick = (colorIndex) => {
    if (memoryTest.showing) return;

    const newUserSequence = [...memoryTest.userSequence, colorIndex];
    setMemoryTest(prev => ({ ...prev, userSequence: newUserSequence }));

    if (newUserSequence.length === memoryTest.sequence.length) {
      const correct = newUserSequence.every((color, index) => color === memoryTest.sequence[index]);
      finishMemoryTest(correct, newUserSequence);
    }
  };

  const finishMemoryTest = async (correct, userSequence) => {
    const results = {
      sequence: memoryTest.sequence,
      userSequence,
      correct,
      level: memoryTest.level,
      accuracy: correct ? 100 : 0
    };

    setTestResults(prev => ({ ...prev, memory: results }));

    if (sessionId && isConnected) {
      try {
        await api.submitMemoryTest({
          sessionId,
          results: {
            rounds: [{
              length: memoryTest.sequence.length,
              correct,
              time: 5000 // Estimated time
            }],
            maxSequence: correct ? memoryTest.sequence.length : memoryTest.sequence.length - 1,
            totalCorrect: correct ? 1 : 0,
            totalAttempts: 1
          },
          mentalStateAtStart: mentalState,
          mentalStateAtEnd: mentalState
        });
      } catch (error) {
        console.error('Failed to submit memory test:', error);
      }
    }

    setIsRunningTest(false);
  };

  // Color Test Functions
  const startColorTest = () => {
    setActiveTest('color');
    setIsRunningTest(true);
    generateColorTest();
  };

  const generateColorTest = () => {
    const baseColor = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    ];
    
    const difficulty = 20;
    const targetColor = [...baseColor];
    const options = [targetColor];

    // Generate similar colors
    for (let i = 0; i < 3; i++) {
      const variant = baseColor.map(c => 
        Math.max(0, Math.min(255, c + (Math.random() - 0.5) * difficulty * 2))
      );
      options.push(variant);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    setColorTest({
      targetColor,
      options,
      startTime: Date.now(),
      correct: 0,
      total: 0
    });
  };

  const handleColorChoice = async (chosenColor) => {
    const correct = JSON.stringify(chosenColor) === JSON.stringify(colorTest.targetColor);
    const responseTime = Date.now() - colorTest.startTime;

    const results = {
      correct,
      responseTime,
      difficulty: 20,
      targetColor: colorTest.targetColor,
      chosenColor
    };

    setTestResults(prev => ({ ...prev, color: results }));

    if (sessionId && isConnected) {
      try {
        await api.submitColorTest({
          sessionId,
          results: {
            tests: [{
              difficulty: 20,
              correct,
              responseTime
            }],
            correctAnswers: correct ? 1 : 0,
            totalTests: 1,
            averageResponseTime: responseTime
          },
          mentalStateAtStart: mentalState,
          mentalStateAtEnd: mentalState
        });
      } catch (error) {
        console.error('Failed to submit color test:', error);
      }
    }

    setIsRunningTest(false);
  };

  const resetTests = () => {
    setActiveTest(null);
    setIsRunningTest(false);
    setTestResults({});
    setReactionTest({
      attempts: [],
      currentAttempt: 0,
      waiting: false,
      canClick: false,
      startTime: null,
      waitDelay: null
    });
    setMemoryTest({
      sequence: [],
      userSequence: [],
      showing: false,
      currentIndex: 0,
      level: 4
    });
    setColorTest({
      targetColor: null,
      options: [],
      startTime: null,
      correct: 0,
      total: 0
    });
  };

  const renderTestInterface = () => {
    if (!activeTest) {
      return (
        <div className="text-center py-8">
          <Brain size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">Psychology Test Suite</h3>
          <p className="text-gray-400 mb-6">Select a cognitive test to begin</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={startReactionTest}
              disabled={!sessionId}
              className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg transition-colors"
            >
              <Timer className="mx-auto mb-2" size={24} />
              <div className="text-white font-semibold">Reaction Time</div>
              <div className="text-blue-200 text-sm">Test response speed</div>
            </button>
            
            <button
              onClick={startMemoryTest}
              disabled={!sessionId}
              className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg transition-colors"
            >
              <Brain className="mx-auto mb-2" size={24} />
              <div className="text-white font-semibold">Memory Sequence</div>
              <div className="text-purple-200 text-sm">Test working memory</div>
            </button>
            
            <button
              onClick={startColorTest}
              disabled={!sessionId}
              className="p-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 rounded-lg transition-colors"
            >
              <Palette className="mx-auto mb-2" size={24} />
              <div className="text-white font-semibold">Color Perception</div>
              <div className="text-orange-200 text-sm">Test color sensitivity</div>
            </button>
          </div>
          
          {!sessionId && (
            <p className="text-gray-400 text-sm mt-4">Create a session first to enable testing</p>
          )}
        </div>
      );
    }

    if (activeTest === 'reaction') {
      return (
        <div className="text-center py-8">
          <h4 className="text-lg font-semibold text-white mb-6">
            Reaction Time Test - Attempt {reactionTest.currentAttempt + 1}/5
          </h4>
          
          <div 
            className={`w-48 h-48 mx-auto rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center ${
              reactionTest.canClick 
                ? 'bg-green-500 hover:bg-green-400 scale-110' 
                : reactionTest.waiting
                ? 'bg-yellow-500'
                : 'bg-gray-700'
            }`}
            onClick={handleReactionClick}
          >
            <div className="text-white text-2xl font-bold">
              {reactionTest.canClick ? 'CLICK!' : reactionTest.waiting ? 'WAIT...' : 'Ready'}
            </div>
          </div>
          
          {reactionTest.attempts.length > 0 && (
            <div className="mt-4 text-sm text-gray-400">
              Last: {reactionTest.attempts[reactionTest.attempts.length - 1]}ms
            </div>
          )}
        </div>
      );
    }

    if (activeTest === 'memory') {
      const colors = [
        'bg-red-500',
        'bg-blue-500', 
        'bg-green-500',
        'bg-yellow-500'
      ];

      return (
        <div className="text-center py-8">
          <h4 className="text-lg font-semibold text-white mb-6">
            Memory Sequence Test - Level {memoryTest.level}
          </h4>
          
          <div className="grid grid-cols-2 gap-4 w-48 mx-auto mb-6">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`w-20 h-20 rounded-lg cursor-pointer transition-all ${color} ${
                  memoryTest.showing && memoryTest.currentIndex === index 
                    ? 'scale-110 brightness-150' 
                    : 'brightness-75 hover:brightness-100'
                }`}
                onClick={() => handleMemoryClick(index)}
              />
            ))}
          </div>
          
          <div>
            {memoryTest.showing ? (
              <p className="text-gray-400">Watch the sequence...</p>
            ) : (
              <p className="text-gray-400">
                Repeat the sequence ({memoryTest.userSequence.length}/{memoryTest.sequence.length})
              </p>
            )}
          </div>
        </div>
      );
    }

    if (activeTest === 'color') {
      return (
        <div className="text-center py-8">
          <h4 className="text-lg font-semibold text-white mb-6">Color Perception Test</h4>
          
          <div className="mb-6">
            <p className="text-gray-400 mb-4">Find the different color:</p>
            <div className="grid grid-cols-2 gap-4 w-48 mx-auto">
              {colorTest.options.map((color, index) => (
                <div
                  key={index}
                  className="w-20 h-20 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: `rgb(${color.join(',')})` }}
                  onClick={() => handleColorChoice(color)}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Brain className="mr-2 text-purple-400" size={20} />
          Interactive Psychology
        </h3>
        <button
          onClick={resetTests}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          disabled={isRunningTest}
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Mental State Controller */}
      <MentalStateController />

      {/* Test Interface */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">Psychology Tests</h4>
          {isRunningTest && (
            <div className="flex items-center text-green-400">
              <Activity className="mr-1 animate-pulse" size={16} />
              <span className="text-sm">Test in progress...</span>
            </div>
          )}
        </div>
        
        {renderTestInterface()}
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4">Recent Results</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testResults.reaction && (
              <div className="bg-gray-700 p-3 rounded-lg">
                <h5 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <Timer className="mr-1" size={16} />
                  Reaction Time
                </h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average:</span>
                    <span className="text-white">{testResults.reaction.average}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best:</span>
                    <span className="text-green-400">{testResults.reaction.best}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Consistency:</span>
                    <span className="text-yellow-400">{(testResults.reaction.consistency * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {testResults.memory && (
              <div className="bg-gray-700 p-3 rounded-lg">
                <h5 className="text-purple-400 font-semibold mb-2 flex items-center">
                  <Brain className="mr-1" size={16} />
                  Memory Test
                </h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Result:</span>
                    <span className={testResults.memory.correct ? "text-green-400" : "text-red-400"}>
                      {testResults.memory.correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">{testResults.memory.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-yellow-400">{testResults.memory.accuracy}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {testResults.color && (
              <div className="bg-gray-700 p-3 rounded-lg">
                <h5 className="text-orange-400 font-semibold mb-2 flex items-center">
                  <Palette className="mr-1" size={16} />
                  Color Perception
                </h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Result:</span>
                    <span className={testResults.color.correct ? "text-green-400" : "text-red-400"}>
                      {testResults.color.correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">{testResults.color.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="text-yellow-400">{testResults.color.difficulty}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractivePsychology;