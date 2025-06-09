// fullstack-psychology/frontend/src/App.jsx - Main Application Component
import React, { useState, useEffect } from 'react';
import { Brain, Activity, BarChart3, Play, Pause, Settings, TrendingUp } from 'lucide-react';

// Import our custom hook and components
import useConsciousness from './hooks/useConsciousness.js';
import InteractivePsychology from './components/InteractivePsychology.jsx';
import ConsciousnessMonitor from './components/ConsciousnessMonitor.jsx';
import NeuralNetwork from './components/NeuralNetwork.jsx';
import BrainwaveVisualizer from './components/BrainwaveVisualizer.jsx';
import api from './services/api.js';

const App = () => {
  const {
    mentalState,
    brainwaves,
    consciousnessScore,
    emotionalState,
    sessionId,
    isConnected,
    isMonitoring,
    sessionDuration,
    interactions,
    mentalBalance,
    cognitiveLoad,
    createSession,
    updateMentalState,
    endSession,
    toggleMonitoring,
    resetConsciousness
  } = useConsciousness();

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Load analytics data
  useEffect(() => {
    if (showAnalytics) {
      const loadAnalytics = async () => {
        try {
          const data = await api.getCombinedAnalytics();
          setAnalytics(data);
        } catch (error) {
          console.error('Failed to load analytics:', error);
        }
      };
      loadAnalytics();
    }
  }, [showAnalytics]);

  // Monitor connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  const handleStartSession = async () => {
    try {
      setConnectionStatus('connecting');
      await createSession();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to start session:', error);
    }
  };

  const handleStopSession = async () => {
    try {
      await endSession();
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="glass-effect-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="text-purple-400 mr-3" size={32} />
              <div>
                <h1 className="text-xl font-bold text-white">Interactive Psychology</h1>
                <p className="text-sm text-gray-400">React + Node.js + MongoDB</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <BarChart3 className="mr-2" size={16} />
                Analytics
              </button>
              
              <button
                onClick={resetConsciousness}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center"
              >
                <Settings className="mr-2" size={16} />
                Reset
              </button>
              
              {sessionId ? (
                <button
                  onClick={isMonitoring ? toggleMonitoring : handleStopSession}
                  className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                    isMonitoring 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <Pause className="mr-2" size={16} />
                  {isMonitoring ? 'Pause' : 'End Session'}
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={connectionStatus === 'connecting'}
                >
                  <Play className="mr-2" size={16} />
                  Start Session
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Real-Time Consciousness Monitoring
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            Advanced React frontend with psychology-driven state management
          </p>
          <p className="text-gray-400">
            Level 3 Skills: Component Architecture • Custom Hooks • Real-time APIs • State Management
          </p>
        </div>
        
        {/* Status Bar */}
        <div className="mb-8">
          <div className="glass-effect rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className={`${getConnectionStatusColor()}`}>
                    {getConnectionStatusText()}
                  </span>
                </div>
                
                {sessionId && (
                  <>
                    <div className="flex items-center">
                      <Activity className={`mr-2 ${isMonitoring ? 'text-green-400' : 'text-gray-400'}`} size={16} />
                      <span className="text-gray-300">
                        Session: {sessionId.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">Duration:</span>
                      <span className="text-white font-mono">
                        {formatDuration(sessionDuration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">Interactions:</span>
                      <span className="text-white font-mono">{interactions}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Score:</span>
                  <span className={`font-bold text-lg ${
                    consciousnessScore >= 80 ? 'text-green-400' :
                    consciousnessScore >= 60 ? 'text-yellow-400' :
                    consciousnessScore >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {consciousnessScore}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Balance:</span>
                  <span className="text-blue-400 font-semibold">{mentalBalance}%</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Load:</span>
                  <span className={`font-semibold ${
                    cognitiveLoad > 70 ? 'text-red-400' :
                    cognitiveLoad > 50 ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {cognitiveLoad}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="mb-8">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Real-time Analytics Dashboard
                </h3>
                <div className="text-xs text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              {analytics ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Total Sessions</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {analytics.analytics?.sessions?.totalSessions || 0}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Avg Focus</div>
                    <div className="text-2xl font-bold text-green-400">
                      {analytics.analytics?.consciousness?.mentalState?.focus?.toFixed(1) || 0}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Creativity</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {analytics.analytics?.consciousness?.mentalState?.creativity?.toFixed(1) || 0}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Health Score</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {analytics.insights?.overallHealth || 0}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading analytics...</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Consciousness Monitor */}
            <ConsciousnessMonitor 
              consciousnessScore={consciousnessScore}
              mentalState={mentalState}
              emotionalState={emotionalState}
              sessionId={sessionId}
              mentalBalance={mentalBalance}
              cognitiveLoad={cognitiveLoad}
            />
            
            {/* Neural Network Visualization */}
            <NeuralNetwork 
              isActive={isMonitoring}
              consciousnessScore={consciousnessScore}
              mentalState={mentalState}
              connections={Math.floor(consciousnessScore / 8)}
            />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Brainwave Visualizer */}
            <BrainwaveVisualizer 
              brainwaves={brainwaves}
              isActive={isMonitoring}
              emotionalState={emotionalState}
            />
            
            {/* Interactive Psychology Component */}
            <InteractivePsychology 
              mentalState={mentalState}
              onUpdateMentalState={updateMentalState}
              sessionId={sessionId}
              isConnected={isConnected}
              isMonitoring={isMonitoring}
            />
          </div>
        </div>
        
        {/* Skills Navigation */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Explore Development Levels</h3>
          <p className="text-gray-400 mb-6">
            This React application demonstrates Level 3 full-stack development skills
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="../../index.html"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
            >
              <div className="mr-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              </div>
              Level 1: Visual Psychology (Pure CSS)
            </a>
            
            <a 
              href="../../responsive-psychology/responsive.html"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
            >
              <div className="mr-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
              Level 2: Responsive Mind (Bootstrap + JS)
            </a>
            
            <div className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center">
              <div className="mr-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              Level 3: Interactive Psychology (React + Node)
            </div>
            
            <a 
              href="http://localhost:3001/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center"
            >
              <div className="mr-3">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              </div>
              Backend Systems (Node.js + MongoDB)
            </a>
          </div>
        </div>
        
        {/* Technical Details */}
        <div className="mt-8 text-center">
          <div className="glass-effect rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Technical Implementation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-400 font-semibold">Frontend</div>
                <div className="text-gray-400">React 18 + Hooks</div>
                <div className="text-gray-400">Custom State Management</div>
                <div className="text-gray-400">Real-time Updates</div>
              </div>
              
              <div>
                <div className="text-green-400 font-semibold">Backend</div>
                <div className="text-gray-400">Node.js + Express</div>
                <div className="text-gray-400">RESTful APIs</div>
                <div className="text-gray-400">Psychology Algorithms</div>
              </div>
              
              <div>
                <div className="text-orange-400 font-semibold">Database</div>
                <div className="text-gray-400">MongoDB + Mongoose</div>
                <div className="text-gray-400">Real-time Analytics</div>
                <div className="text-gray-400">Session Management</div>
              </div>
              
              <div>
                <div className="text-purple-400 font-semibold">Features</div>
                <div className="text-gray-400">Consciousness Monitoring</div>
                <div className="text-gray-400">Psychology Tests</div>
                <div className="text-gray-400">Brainwave Simulation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;import React, { useState, useEffect } from 'react';
import { Brain, Activity, BarChart3, Play, Pause, RotateCcw, Zap, Eye, Palette, Timer } from 'lucide-react';

// API Service
const API_BASE = 'http://localhost:3001/api';

const api = {
  createSession: async (sessionData) => {
    const response = await fetch(`${API_BASE}/consciousness/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    return response.json();
  },
  
  updateMentalState: async (sessionId, mentalState) => {
    const response = await fetch(`${API_BASE}/consciousness/session/${sessionId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentalState })
    });
    return response.json();
  },
  
  submitTest: async (testType, testData) => {
    const response = await fetch(`${API_BASE}/psychology/tests/${testType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    return response.json();
  },
  
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE}/analytics`);
    return response.json();
  }
};

// Custom Hook for Consciousness State
const useConsciousness = () => {
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
  
  useEffect(() => {
    // Calculate brainwaves from mental state
    const newBrainwaves = {
      alpha: 8 + (mentalState.creativity / 100) * 5,
      beta: 13 + (mentalState.focus / 100) * 17,
      theta: 4 + ((100 - mentalState.stress) / 100) * 4,
      gamma: 30 + ((mentalState.focus + mentalState.creativity) / 200) * 70,
      delta: 1 + Math.random() * 2
    };
    setBrainwaves(newBrainwaves);
    
    // Calculate consciousness score
    const mentalScore = (
      mentalState.focus * 0.3 +
      mentalState.creativity * 0.25 +
      mentalState.energy * 0.2 +
      (100 - mentalState.stress) * 0.25
    );
    
    const brainwaveScore = (
      Math.min(newBrainwaves.alpha / 12, 1) * 25 +
      Math.min(newBrainwaves.beta / 25, 1) * 30 +
      Math.min(newBrainwaves.theta / 8, 1) * 20 +
      Math.min(newBrainwaves.gamma / 50, 1) * 25
    );
    
    const score = Math.round((mentalScore * 0.7) + (brainwaveScore * 0.3));
    setConsciousnessScore(score);
  }, [mentalState]);
  
  const createSession = async () => {
    try {
      const response = await api.createSession({
        userAgent: 'React Psychology Demo',
        mentalState
      });
      setSessionId(response.session.sessionId);
      return response;
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };
  
  const updateState = async (newState) => {
    setMentalState(prev => ({ ...prev, ...newState }));
    if (sessionId) {
      try {
        await api.updateMentalState(sessionId, { ...mentalState, ...newState });
      } catch (error) {
        console.error('Failed to update mental state:', error);
      }
    }
  };
  
  return {
    mentalState,
    brainwaves,
    consciousnessScore,
    sessionId,
    createSession,
    updateState
  };
};

// Brainwave Visualizer Component
const BrainwaveVisualizer = ({ brainwaves, isActive = true }) => {
  const [animationOffset, setAnimationOffset] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + 1) % 100);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  const waveData = Object.entries(brainwaves).map(([type, frequency], index) => {
    const amplitude = frequency / 50;
    const color = {
      alpha: '#10B981',
      beta: '#3B82F6', 
      theta: '#8B5CF6',
      gamma: '#F59E0B',
      delta: '#EF4444'
    }[type];
    
    return {
      type,
      frequency: frequency.toFixed(1),
      amplitude,
      color,
      path: generateWavePath(amplitude, frequency, animationOffset + index * 20)
    };
  });
  
  function generateWavePath(amplitude, frequency, offset) {
    const points = [];
    for (let x = 0; x <= 300; x += 5) {
      const y = 50 + amplitude * 30 * Math.sin((x + offset) * frequency * 0.01);
      points.push(`${x},${y}`);
    }
    return `M${points.join(' L')}`;
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Activity className="mr-2" size={20} />
          Brainwave Monitor
        </h3>
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
      </div>
      
      <svg width="300" height="100" viewBox="0 0 300 100" className="w-full mb-4">
        {waveData.map(({ type, path, color }) => (
          <path
            key={type}
            d={path}
            stroke={color}
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
        ))}
      </svg>
      
      <div className="grid grid-cols-5 gap-2 text-sm">
        {waveData.map(({ type, frequency, color }) => (
          <div key={type} className="text-center">
            <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Mental Balance</div>
            <div className="text-white font-semibold">
              {Math.round((mentalState.focus + mentalState.creativity + mentalState.energy + (100 - mentalState.stress)) / 4)}%
            </div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Cognitive Load</div>
            <div className="text-white font-semibold">
              {Math.round((100 - mentalState.focus + mentalState.stress) / 2)}%
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-2">State Distribution</div>
          <div className="space-y-2">
            {Object.entries(mentalState).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <div className="w-16 text-gray-400 text-sm capitalize">{key}:</div>
                <div className="flex-1 bg-gray-700 rounded-full h-2 mx-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      key === 'focus' ? 'bg-blue-500' :
                      key === 'creativity' ? 'bg-purple-500' :
                      key === 'stress' ? 'bg-red-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <div className="w-8 text-gray-400 text-sm">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Neural Network Visualization Component
const NeuralNetwork = ({ isActive = true, connections = 12 }) => {
  const [nodes, setNodes] = useState([]);
  const [pulseAnimation, setPulseAnimation] = useState(0);
  
  useEffect(() => {
    // Generate random node positions
    const newNodes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 260,
      y: 20 + Math.random() * 160,
      active: Math.random() > 0.3,
      type: ['input', 'hidden', 'output'][Math.floor(Math.random() * 3)]
    }));
    setNodes(newNodes);
  }, []);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setPulseAnimation(prev => (prev + 1) % 360);
      
      // Randomly activate/deactivate nodes
      setNodes(prev => prev.map(node => ({
        ...node,
        active: Math.random() > 0.4
      })));
    }, 500);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  const getNodeColor = (type, active) => {
    if (!active) return '#374151';
    
    const colors = {
      input: '#10B981',
      hidden: '#8B5CF6', 
      output: '#F59E0B'
    };
    return colors[type] || '#6B7280';
  };
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Neural Network</h3>
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
      </div>
      
      <svg width="300" height="200" viewBox="0 0 300 200" className="w-full">
        {/* Connection lines */}
        {nodes.slice(0, connections).map((node1, i) => 
          nodes.slice(i + 1, Math.min(i + 3, nodes.length)).map((node2, j) => (
            <line
              key={`${i}-${j}`}
              x1={node1.x}
              y1={node1.y}
              x2={node2.x}
              y2={node2.y}
              stroke={node1.active && node2.active ? '#EC4899' : '#374151'}
              strokeWidth={node1.active && node2.active ? "2" : "1"}
              opacity={node1.active && node2.active ? "0.6" : "0.2"}
            />
          ))
        )}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.active ? "8" : "6"}
            fill={getNodeColor(node.type, node.active)}
            stroke="#1F2937"
            strokeWidth="2"
            opacity={node.active ? "1" : "0.5"}
          >
            {node.active && (
              <animate
                attributeName="r"
                values="6;10;6"
                dur="1s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </svg>
      
      <div className="grid grid-cols-3 gap-2 text-xs mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span className="text-gray-400">Input</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
          <span className="text-gray-400">Hidden</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
          <span className="text-gray-400">Output</span>
        </div>
      </div>
    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Analytics Dashboard
        </h3>
        <div className="text-xs text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Total Sessions</div>
              <div className="text-2xl font-bold text-blue-400">
                {analytics.analytics?.sessions?.totalSessions || 0}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Avg Focus</div>
              <div className="text-2xl font-bold text-green-400">
                {analytics.analytics?.consciousness?.mentalState?.focus?.toFixed(1) || 0}%
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Creativity Index</div>
              <div className="text-2xl font-bold text-purple-400">
                {analytics.analytics?.consciousness?.mentalState?.creativity?.toFixed(1) || 0}%
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Overall Health</div>
              <div className="text-2xl font-bold text-orange-400">
                {analytics.insights?.overallHealth || 0}%
              </div>
            </div>
          </div>
          
          {analytics.analytics?.psychology?.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Test Performance</h4>
              <div className="space-y-3">
                {analytics.analytics.psychology.map((test, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium capitalize">
                        {test.testType?.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400">{test.count} tests</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Accuracy:</span>
                      <span className="text-green-400">{test.avgAccuracy?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Time:</span>
                      <span className="text-blue-400">{(test.avgCompletionTime / 1000)?.toFixed(1)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const {
    mentalState,
    brainwaves,
    consciousnessScore,
    sessionId,
    createSession,
    updateState
  } = useConsciousness();
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const handleCreateSession = async () => {
    try {
      await createSession();
      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };
  
  const toggleMonitoring = () => {
    if (!sessionId) {
      handleCreateSession();
    } else {
      setIsMonitoring(!isMonitoring);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black bg-opacity-50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="text-purple-400 mr-3" size={32} />
              <div>
                <h1 className="text-xl font-bold text-white">Interactive Psychology</h1>
                <p className="text-sm text-gray-400">React + Node.js + MongoDB</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <BarChart3 className="inline mr-2" size={16} />
                Analytics
              </button>
              
              <button
                onClick={toggleMonitoring}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  isMonitoring 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="mr-2" size={16} />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="mr-2" size={16} />
                    Start Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Real-Time Consciousness Monitoring
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            Experience psychology-driven development with React frontend
          </p>
          <p className="text-gray-400">
            Level 3 Skills: Component Architecture • State Management • Real-time APIs
          </p>
        </div>
        
        {/* Status Bar */}
        <div className="mb-8">
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${sessionId ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-gray-300">
                    {sessionId ? `Session: ${sessionId.slice(-8)}` : 'No Active Session'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Activity className={`mr-2 ${isMonitoring ? 'text-green-400' : 'text-gray-400'}`} size={16} />
                  <span className="text-gray-300">
                    {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-400">Backend:</span>
                <span className="text-green-400">Connected</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-400">Score:</span>
                <span className={`font-bold ${
                  consciousnessScore >= 80 ? 'text-green-400' :
                  consciousnessScore >= 60 ? 'text-yellow-400' :
                  consciousnessScore >= 40 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {consciousnessScore}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="mb-8">
            <AnalyticsDashboard />
          </div>
        )}
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            <MentalStateController 
              mentalState={mentalState}
              onUpdate={updateState}
              isConnected={!!sessionId}
            />
            
            <ConsciousnessMonitor 
              consciousnessScore={consciousnessScore}
              mentalState={mentalState}
              sessionId={sessionId}
            />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <BrainwaveVisualizer 
              brainwaves={brainwaves}
              isActive={isMonitoring}
            />
            
            <NeuralNetwork 
              isActive={isMonitoring}
              connections={Math.floor(consciousnessScore / 10)}
            />
          </div>
        </div>
        
        {/* Psychology Test Suite */}
        <div className="mb-8">
          <PsychologyTest 
            sessionId={sessionId}
            mentalState={mentalState}
          />
        </div>
        
        {/* Skills Navigation */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Explore More Demonstrations</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="../index.html"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
            >
              Visual Psychology (Pure CSS)
            </a>
            <a 
              href="../responsive-psychology/responsive.html"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
            >
              Responsive Mind (Bootstrap + JS)
            </a>
            <a 
              href="http://localhost:3001/demo"
              target="_blank"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
            >
              Backend Systems (Node.js + MongoDB)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;text-gray-400 uppercase text-xs">{type}</div>
            <div style={{ color }} className="font-mono font-bold">
              {frequency} Hz
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mental State Controller Component
const MentalStateController = ({ mentalState, onUpdate, isConnected }) => {
  const handleSliderChange = (key, value) => {
    onUpdate({ [key]: parseInt(value) });
  };
  
  const stateConfig = [
    { key: 'focus', label: 'Focus', color: 'blue', icon: Eye },
    { key: 'creativity', label: 'Creativity', color: 'purple', icon: Brain },
    { key: 'stress', label: 'Stress', color: 'red', icon: Zap },
    { key: 'energy', label: 'Energy', color: 'orange', icon: Activity }
  ];
  
  const getColorClass = (color, type = 'bg') => {
    const colors = {
      blue: type === 'bg' ? 'bg-blue-500' : 'text-blue-400',
      purple: type === 'bg' ? 'bg-purple-500' : 'text-purple-400',
      red: type === 'bg' ? 'bg-red-500' : 'text-red-400',
      orange: type === 'bg' ? 'bg-orange-500' : 'text-orange-400'
    };
    return colors[color];
  };
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Mental State Controller</h3>
        <div className={`flex items-center text-sm ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
          {isConnected ? 'Connected' : 'Offline'}
        </div>
      </div>
      
      <div className="space-y-6">
        {stateConfig.map(({ key, label, color, icon: Icon }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Icon size={16} className={`mr-2 ${getColorClass(color, 'text')}`} />
                <label className="text-gray-300 font-medium">{label}</label>
              </div>
              <span className={`font-mono text-lg ${getColorClass(color, 'text')}`}>
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
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${getColorClass(color, 'bg').replace('bg-', '#')} 0%, ${getColorClass(color, 'bg').replace('bg-', '#')} ${mentalState[key]}%, #374151 ${mentalState[key]}%, #374151 100%)`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

// Psychology Test Component
const PsychologyTest = ({ sessionId, mentalState }) => {
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  
  // Reaction Time Test
  const [reactionData, setReactionData] = useState({
    attempts: [],
    waitTime: null,
    startTime: null,
    canClick: false
  });
  
  // Memory Test
  const [memorySequence, setMemorySequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  
  // Color Test
  const [colorData, setColorData] = useState({
    targetColor: null,
    options: [],
    startTime: null,
    results: []
  });
  
  const startReactionTest = () => {
    setCurrentTest('reaction');
    setIsRunning(true);
    setReactionData({ attempts: [], waitTime: null, startTime: null, canClick: false });
    
    const waitTime = 2000 + Math.random() * 3000;
    setTimeout(() => {
      setReactionData(prev => ({
        ...prev,
        canClick: true,
        startTime: Date.now(),
        waitTime
      }));
    }, waitTime);
  };
  
  const handleReactionClick = () => {
    if (!reactionData.canClick) return;
    
    const reactionTime = Date.now() - reactionData.startTime;
    const newAttempts = [...reactionData.attempts, reactionTime];
    
    setReactionData(prev => ({
      ...prev,
      attempts: newAttempts,
      canClick: false
    }));
    
    if (newAttempts.length >= 5) {
      finishReactionTest(newAttempts);
    } else {
      setTimeout(() => startReactionTest(), 1500);
    }
  };
  
  const finishReactionTest = async (attempts) => {
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    const best = Math.min(...attempts);
    const worst = Math.max(...attempts);
    const variance = attempts.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / attempts.length;
    const consistency = Math.max(0, 1 - (Math.sqrt(variance) / average));
    
    const testData = {
      sessionId,
      results: { attempts, average: Math.round(average), best, worst, consistency },
      mentalStateAtStart: mentalState,
      mentalStateAtEnd: mentalState
    };
    
    try {
      const response = await api.submitTest('reaction', testData);
      setTestResults(prev => ({ ...prev, reaction: response }));
    } catch (error) {
      console.error('Failed to submit reaction test:', error);
    }
    
    setIsRunning(false);
  };
  
  const startMemoryTest = () => {
    setCurrentTest('memory');
    setIsRunning(true);
    const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
    setMemorySequence(sequence);
    setUserSequence([]);
    setShowingSequence(true);
    setSequenceIndex(0);
    
    showSequence(sequence);
  };
  
  const showSequence = (sequence) => {
    sequence.forEach((color, index) => {
      setTimeout(() => {
        setSequenceIndex(index);
        if (index === sequence.length - 1) {
          setTimeout(() => {
            setShowingSequence(false);
          }, 800);
        }
      }, index * 800);
    });
  };
  
  const handleMemoryClick = (colorIndex) => {
    if (showingSequence) return;
    
    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);
    
    if (newUserSequence.length === memorySequence.length) {
      const correct = newUserSequence.every((color, index) => color === memorySequence[index]);
      finishMemoryTest(correct);
    }
  };
  
  const finishMemoryTest = async (correct) => {
    const testData = {
      sessionId,
      results: {
        rounds: [{
          length: memorySequence.length,
          correct,
          time: 5000
        }],
        maxSequence: correct ? memorySequence.length : memorySequence.length - 1,
        totalCorrect: correct ? 1 : 0,
        totalAttempts: 1
      },
      mentalStateAtStart: mentalState,
      mentalStateAtEnd: mentalState
    };
    
    try {
      const response = await api.submitTest('memory', testData);
      setTestResults(prev => ({ ...prev, memory: response }));
    } catch (error) {
      console.error('Failed to submit memory test:', error);
    }
    
    setIsRunning(false);
  };
  
  const startColorTest = () => {
    setCurrentTest('color');
    setIsRunning(true);
    generateColorTest();
  };
  
  const generateColorTest = () => {
    const baseColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    const difficulty = 20;
    const targetColor = [...baseColor];
    const options = [targetColor];
    
    for (let i = 0; i < 3; i++) {
      const variant = baseColor.map(c => Math.max(0, Math.min(255, c + (Math.random() - 0.5) * difficulty * 2)));
      options.push(variant);
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    setColorData({
      targetColor,
      options,
      startTime: Date.now(),
      results: []
    });
  };
  
  const handleColorChoice = async (chosenColor) => {
    const correct = chosenColor === colorData.targetColor;
    const responseTime = Date.now() - colorData.startTime;
    
    const testData = {
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
    };
    
    try {
      const response = await api.submitTest('color', testData);
      setTestResults(prev => ({ ...prev, color: response }));
    } catch (error) {
      console.error('Failed to submit color test:', error);
    }
    
    setIsRunning(false);
  };
  
  const resetTests = () => {
    setCurrentTest(null);
    setIsRunning(false);
    setTestResults({});
    setReactionData({ attempts: [], waitTime: null, startTime: null, canClick: false });
    setMemorySequence([]);
    setUserSequence([]);
    setColorData({ targetColor: null, options: [], startTime: null, results: [] });
  };
  
  const renderTestInterface = () => {
    if (!currentTest) {
      return (
        <div className="text-center py-12">
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
    
    if (currentTest === 'reaction') {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-6">Reaction Time Test</h3>
          
          <div 
            className={`w-48 h-48 mx-auto rounded-full cursor-pointer transition-all duration-300 ${
              reactionData.canClick 
                ? 'bg-green-500 hover:bg-green-400' 
                : 'bg-gray-700'
            }`}
            onClick={handleReactionClick}
          >
            <div className="flex items-center justify-center h-full">
              {reactionData.canClick ? (
                <div className="text-white text-2xl font-bold">CLICK!</div>
              ) : (
                <div className="text-gray-400">Wait...</div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-400">
              Attempt {reactionData.attempts.length + 1} of 5
            </p>
            {reactionData.attempts.length > 0 && (
              <p className="text-white mt-2">
                Last: {reactionData.attempts[reactionData.attempts.length - 1]}ms
              </p>
            )}
          </div>
        </div>
      );
    }
    
    if (currentTest === 'memory') {
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
      
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-6">Memory Sequence Test</h3>
          
          <div className="grid grid-cols-2 gap-4 w-48 mx-auto mb-6">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`w-20 h-20 rounded-lg cursor-pointer transition-all ${color} ${
                  showingSequence && sequenceIndex === index ? 'scale-110 brightness-150' : 'brightness-75'
                } ${!showingSequence ? 'hover:brightness-100' : ''}`}
                onClick={() => handleMemoryClick(index)}
              />
            ))}
          </div>
          
          <div>
            {showingSequence ? (
              <p className="text-gray-400">Watch the sequence...</p>
            ) : (
              <p className="text-gray-400">
                Repeat the sequence ({userSequence.length}/{memorySequence.length})
              </p>
            )}
          </div>
        </div>
      );
    }
    
    if (currentTest === 'color') {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-6">Color Perception Test</h3>
          
          <div className="mb-6">
            <p className="text-gray-400 mb-4">Find the different color:</p>
            <div className="grid grid-cols-2 gap-4 w-48 mx-auto">
              {colorData.options.map((color, index) => (
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
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Psychology Testing</h3>
        <button
          onClick={resetTests}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      </div>
      
      {renderTestInterface()}
      
      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Test Results</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testResults.reaction && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h5 className="text-blue-400 font-semibold mb-2">Reaction Time</h5>
                <p className="text-white">Avg: {testResults.reaction.test.results.average}ms</p>
                <p className="text-gray-400">Best: {testResults.reaction.test.results.best}ms</p>
              </div>
            )}
            {testResults.memory && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h5 className="text-purple-400 font-semibold mb-2">Memory</h5>
                <p className="text-white">Accuracy: {testResults.memory.test.accuracy}%</p>
                <p className="text-gray-400">Sequence: {testResults.memory.test.results.maxSequence}</p>
              </div>
            )}
            {testResults.color && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h5 className="text-orange-400 font-semibold mb-2">Color Perception</h5>
                <p className="text-white">Accuracy: {testResults.color.test.accuracy}%</p>
                <p className="text-gray-400">Time: {testResults.color.test.completionTime}ms</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Consciousness Monitor Component
const ConsciousnessMonitor = ({ consciousnessScore, mentalState, sessionId }) => {
  const [emotionalState, setEmotionalState] = useState('balanced');
  
  useEffect(() => {
    const { focus, creativity, stress, energy } = mentalState;
    
    if (focus > 80 && creativity > 80 && stress < 30) {
      setEmotionalState('peak_performance');
    } else if (focus > 70 && creativity > 70 && stress < 40) {
      setEmotionalState('flow_state');
    } else if (creativity > 80 && stress < 40) {
      setEmotionalState('highly_creative');
    } else if (stress > 70) {
      setEmotionalState('overwhelmed');
    } else if (focus > 60 && stress < 30) {
      setEmotionalState('focused');
    } else {
      setEmotionalState('balanced');
    }
  }, [mentalState]);
  
  const getEmotionalStateColor = () => {
    const colors = {
      peak_performance: 'text-yellow-400',
      flow_state: 'text-green-400',
      highly_creative: 'text-purple-400',
      focused: 'text-blue-400',
      overwhelmed: 'text-red-400',
      balanced: 'text-gray-400'
    };
    return colors[emotionalState] || 'text-gray-400';
  };
  
  const getScoreColor = () => {
    if (consciousnessScore >= 80) return 'text-green-400';
    if (consciousnessScore >= 60) return 'text-yellow-400';
    if (consciousnessScore >= 40) return 'text-orange-400';
    return 'text-red-400';
  };
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Brain className="mr-2" size={20} />
          Consciousness Monitor
        </h3>
        {sessionId && (
          <div className="text-xs text-gray-400 font-mono">
            Session: {sessionId.slice(-8)}
          </div>
        )}
      </div>
      
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
          {consciousnessScore}
        </div>
        <div className="text-gray-400">Consciousness Score</div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Emotional State:</span>
          <span className={`font-semibold capitalize ${getEmotionalStateColor()}`}>
            {emotionalState.replace('_', ' ')}
          </span>
        </div>
        
        <div className="