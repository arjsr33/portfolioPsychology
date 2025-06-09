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

  // Mental State Controller
  const MentalStateController = () => {
    const stateConfig = [
      { key: 'focus', label: 'Focus', color: 'blue', icon: Eye },
      { key: 'creativity', label: 'Creativity', color: 'purple', icon: Brain },
      { key: 'stress', label: 'Stress', color: 'red', icon: Zap },
      { key: 'energy', label: 'Energy', color: 'orange', icon: Activity }
    ];

    const getColorClass = (color) => {
      const colors = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        red: 'bg-red-500',
        orange: 'bg-orange-500'
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
              
              <input
                type="range"
                min="0"
                max="100"
                value={mentalState[key]}
                onChange={(e) => handleSliderChange(key, e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${getColorClass(color).replace('bg-', '#')} 0%, ${getColorClass(color).replace('bg-', '#')} ${mentalState[key]}%, #374151 ${mentalState[key]}%, #374151 100%)`
                }}
                disabled={!isConnected}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Reaction Time Test
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

  // Memory Test
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

  // Color Test
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
                onClick={() => handleMem