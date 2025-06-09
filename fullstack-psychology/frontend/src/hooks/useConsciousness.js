// fullstack-psychology/frontend/src/hooks/useConsciousness.js - Consciousness State Management Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api.js';

const useConsciousness = () => {
  // Core state
  const [mentalState, setMentalState] = useState({
    focus: 50,
    creativity: 50,
    stress: 30,
    energy: 60
  });

  const [brainwaves, setBrainwaves] = useState({
    alpha: 10,
    beta: 20,
    theta: 6,
    gamma: 40,
    delta: 2
  });

  const [sessionId, setSessionId] = useState(null);
  const [consciousnessScore, setConsciousnessScore] = useState(0);
  const [emotionalState, setEmotionalState] = useState('balanced');
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [interactions, setInteractions] = useState(0);

  // Refs for cleanup
  const monitoringInterval = useRef(null);
  const connectionCleanup = useRef(null);

  // Calculate brainwaves from mental state
  const calculateBrainwaves = useCallback((state) => {
    return {
      alpha: Math.round((8 + (state.creativity / 100) * 5) * 10) / 10,
      beta: Math.round((13 + (state.focus / 100) * 17) * 10) / 10,
      theta: Math.round((4 + ((100 - state.stress) / 100) * 4) * 10) / 10,
      gamma: Math.round((30 + ((state.focus + state.creativity) / 200) * 70) * 10) / 10,
      delta: Math.round((1 + Math.random() * 2) * 10) / 10
    };
  }, []);

  // Calculate consciousness score
  const calculateConsciousnessScore = useCallback((state, waves) => {
    // Mental state component (70% weight)
    const mentalScore = (
      state.focus * 0.3 +
      state.creativity * 0.25 +
      state.energy * 0.2 +
      (100 - state.stress) * 0.25
    );

    // Brainwave optimization (30% weight)
    const brainwaveScore = (
      Math.min(waves.alpha / 12, 1) * 25 +
      Math.min(waves.beta / 25, 1) * 30 +
      Math.min(waves.theta / 8, 1) * 20 +
      Math.min(waves.gamma / 50, 1) * 25
    );

    return Math.round((mentalScore * 0.7) + (brainwaveScore * 0.3));
  }, []);

  // Determine emotional state from mental state
  const determineEmotionalState = useCallback((state) => {
    const { focus, creativity, stress, energy } = state;

    if (focus > 80 && creativity > 80 && stress < 30) {
      return 'peak_performance';
    } else if (focus > 70 && creativity > 70 && stress < 40) {
      return 'flow_state';
    } else if (creativity > 80 && stress < 40) {
      return 'highly_creative';
    } else if (stress > 70) {
      return 'overwhelmed';
    } else if (focus > 60 && stress < 30) {
      return 'focused';
    } else if (stress < 30 && energy > 60) {
      return 'relaxed';
    } else if (energy > 70 && stress < 40) {
      return 'energetic';
    } else if (focus < 30 && energy < 40) {
      return 'distracted';
    } else {
      return 'balanced';
    }
  }, []);

  // Update derived states when mental state changes
  useEffect(() => {
    const newBrainwaves = calculateBrainwaves(mentalState);
    setBrainwaves(newBrainwaves);

    const newScore = calculateConsciousnessScore(mentalState, newBrainwaves);
    setConsciousnessScore(newScore);

    const newEmotionalState = determineEmotionalState(mentalState);
    setEmotionalState(newEmotionalState);
  }, [mentalState, calculateBrainwaves, calculateConsciousnessScore, determineEmotionalState]);

  // Monitor connection status
  useEffect(() => {
    const startConnectionMonitoring = async () => {
      try {
        connectionCleanup.current = await api.monitorConnection(
          (status) => {
            setIsConnected(status.connected);
            if (!status.connected) {
              console.warn('Backend connection lost:', status.error);
            }
          },
          15000 // Check every 15 seconds
        );
      } catch (error) {
        console.error('Failed to start connection monitoring:', error);
        setIsConnected(false);
      }
    };

    startConnectionMonitoring();

    // Cleanup on unmount
    return () => {
      if (connectionCleanup.current) {
        connectionCleanup.current();
      }
    };
  }, []);

  // Create new session
  const createSession = useCallback(async (sessionData = {}) => {
    try {
      const response = await api.createSession({
        userAgent: sessionData.userAgent || 'React Psychology Frontend',
        mentalState,
        location: sessionData.location || {
          country: 'US',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      if (response.session && response.session.sessionId) {
        setSessionId(response.session.sessionId);
        setSessionStartTime(new Date());
        setInteractions(0);
        setIsMonitoring(true);

        console.log('✅ Session created:', response.session.sessionId);
        return response;
      } else {
        throw new Error('Invalid session response');
      }
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      setIsConnected(false);
      throw error;
    }
  }, [mentalState]);

  // Update mental state
  const updateMentalState = useCallback(async (newState) => {
    const updatedState = { ...mentalState, ...newState };
    setMentalState(updatedState);
    setInteractions(prev => prev + 1);

    // Update backend if session exists
    if (sessionId && isConnected) {
      try {
        await api.updateMentalState(sessionId, updatedState, interactions + 1);
        
        // Record consciousness data
        await api.recordConsciousness({
          sessionId,
          mentalState: updatedState,
          brainwaves: calculateBrainwaves(updatedState),
          cognitiveLoad: Math.round((100 - updatedState.focus + updatedState.stress) / 2),
          attentionLevel: Math.round((updatedState.focus + updatedState.energy) / 2),
          emotionalState: determineEmotionalState(updatedState),
          environmentalFactors: {
            timeOfDay: getTimeOfDay(),
            sessionProgress: getSessionProgress()
          }
        });
      } catch (error) {
        console.warn('Failed to sync mental state with backend:', error);
      }
    }
  }, [mentalState, sessionId, isConnected, interactions, calculateBrainwaves, determineEmotionalState]);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await api.endSession(sessionId);
      setSessionId(null);
      setSessionStartTime(null);
      setIsMonitoring(false);
      setInteractions(0);
      console.log('✅ Session ended successfully');
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      // Force local cleanup even if backend fails
      setSessionId(null);
      setSessionStartTime(null);
      setIsMonitoring(false);
    }
  }, [sessionId]);

  // Get session duration
  const getSessionDuration = useCallback(() => {
    if (!sessionStartTime) return 0;
    return Date.now() - sessionStartTime.getTime();
  }, [sessionStartTime]);

  // Get time of day
  const getTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }, []);

  // Get session progress (0-1)
  const getSessionProgress = useCallback(() => {
    if (!sessionStartTime) return 0;
    const elapsed = Date.now() - sessionStartTime.getTime();
    const maxDuration = 30 * 60 * 1000; // 30 minutes
    return Math.min(1, elapsed / maxDuration);
  }, [sessionStartTime]);

  // Start/stop monitoring
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false);
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
        monitoringInterval.current = null;
      }
    } else {
      setIsMonitoring(true);
      // Set up periodic consciousness recording
      monitoringInterval.current = setInterval(async () => {
        if (sessionId && isConnected) {
          try {
            await api.recordConsciousness({
              sessionId,
              mentalState,
              brainwaves,
              cognitiveLoad: Math.round((100 - mentalState.focus + mentalState.stress) / 2),
              attentionLevel: Math.round((mentalState.focus + mentalState.energy) / 2),
              emotionalState,
              environmentalFactors: {
                timeOfDay: getTimeOfDay(),
                sessionProgress: getSessionProgress()
              }
            });
          } catch (error) {
            console.warn('Background consciousness recording failed:', error);
          }
        }
      }, 5000); // Record every 5 seconds
    }
  }, [isMonitoring, sessionId, isConnected, mentalState, brainwaves, emotionalState, getTimeOfDay, getSessionProgress]);

  // Reset to default state
  const resetConsciousness = useCallback(() => {
    setMentalState({
      focus: 50,
      creativity: 50,
      stress: 30,
      energy: 60
    });
    setInteractions(0);
  }, []);

  // Get mental balance score
  const getMentalBalance = useCallback(() => {
    return Math.round((mentalState.focus + mentalState.creativity + mentalState.energy + (100 - mentalState.stress)) / 4);
  }, [mentalState]);

  // Get cognitive load
  const getCognitiveLoad = useCallback(() => {
    return Math.round((100 - mentalState.focus + mentalState.stress) / 2);
  }, [mentalState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
      if (connectionCleanup.current) {
        connectionCleanup.current();
      }
    };
  }, []);

  return {
    // State
    mentalState,
    brainwaves,
    consciousnessScore,
    emotionalState,
    sessionId,
    isConnected,
    isMonitoring,
    sessionStartTime,
    interactions,

    // Actions
    createSession,
    updateMentalState,
    endSession,
    toggleMonitoring,
    resetConsciousness,

    // Computed values
    mentalBalance: getMentalBalance(),
    cognitiveLoad: getCognitiveLoad(),
    sessionDuration: getSessionDuration(),
    sessionProgress: getSessionProgress(),
    timeOfDay: getTimeOfDay(),

    // Utilities
    calculateBrainwaves,
    calculateConsciousnessScore,
    determineEmotionalState
  };
};

export default useConsciousness;