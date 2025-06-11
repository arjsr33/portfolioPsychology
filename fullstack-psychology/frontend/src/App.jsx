// fullstack-psychology/frontend/src/App.jsx - Main Application Component (Fixed)
import React, { useState, useEffect } from 'react';
import { Brain, Activity, BarChart3, Play, Pause, Settings, TrendingUp, ArrowLeft } from 'lucide-react';

// Import our custom hook and components
import Navbar from './components/Navbar.jsx';
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
    <div className="psychology-page">
      {/* Navigation - Consistent with visual-psychology.html */}
      <Navbar />
      
      <div className="psychology-container">
        {/* App Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
            </div>
            
            <div className="flex items-center space-x-4">
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
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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
                href="/visual-psychology.html"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
              >
                <div className="mr-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                </div>
                Level 1: Visual Psychology (Pure CSS)
              </a>
              
              <a 
                href="/responsive-psychology/responsive.html"
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
    </div>
  );
};

export default App;