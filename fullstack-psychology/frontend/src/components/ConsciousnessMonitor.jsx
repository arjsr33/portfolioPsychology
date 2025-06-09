// fullstack-psychology/frontend/src/components/ConsciousnessMonitor.jsx
import React from 'react';
import { Brain, Activity, Zap, Eye } from 'lucide-react';

const ConsciousnessMonitor = ({ 
  consciousnessScore, 
  mentalState, 
  emotionalState, 
  sessionId, 
  mentalBalance, 
  cognitiveLoad 
}) => {
  const getScoreColor = () => {
    if (consciousnessScore >= 80) return 'text-green-400';
    if (consciousnessScore >= 60) return 'text-yellow-400';
    if (consciousnessScore >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEmotionalStateColor = () => {
    const colors = {
      peak_performance: 'text-yellow-400',
      flow_state: 'text-green-400',
      highly_creative: 'text-purple-400',
      focused: 'text-blue-400',
      energetic: 'text-orange-400',
      relaxed: 'text-green-400',
      overwhelmed: 'text-red-400',
      distracted: 'text-gray-400',
      balanced: 'text-cyan-400'
    };
    return colors[emotionalState] || 'text-gray-400';
  };

  const getScoreDescription = () => {
    if (consciousnessScore >= 90) return 'Exceptional';
    if (consciousnessScore >= 80) return 'Excellent';
    if (consciousnessScore >= 70) return 'Very Good';
    if (consciousnessScore >= 60) return 'Good';
    if (consciousnessScore >= 50) return 'Average';
    if (consciousnessScore >= 40) return 'Below Average';
    if (consciousnessScore >= 30) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Brain className="mr-2 text-purple-400" size={20} />
          Consciousness Monitor
        </h3>
        {sessionId && (
          <div className="text-xs text-gray-400 font-mono">
            Session: {sessionId.slice(-8)}
          </div>
        )}
      </div>
      
      {/* Main Score Display */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
          {consciousnessScore}
        </div>
        <div className="text-gray-400 text-lg mb-1">Consciousness Score</div>
        <div className={`text-sm font-semibold ${getScoreColor()}`}>
          {getScoreDescription()}
        </div>
      </div>
      
      {/* Emotional State */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Emotional State:</span>
          <span className={`font-semibold capitalize ${getEmotionalStateColor()}`}>
            {emotionalState.replace('_', ' ')}
          </span>
        </div>
        
        {/* State description */}
        <div className="text-xs text-gray-500">
          {emotionalState === 'peak_performance' && 'Optimal focus and creativity with minimal stress'}
          {emotionalState === 'flow_state' && 'Deep engagement with balanced mental resources'}
          {emotionalState === 'highly_creative' && 'Enhanced creative thinking and innovation'}
          {emotionalState === 'focused' && 'Strong concentration with good stress management'}
          {emotionalState === 'energetic' && 'High energy levels supporting active engagement'}
          {emotionalState === 'relaxed' && 'Calm and peaceful state with low stress'}
          {emotionalState === 'overwhelmed' && 'High stress levels affecting performance'}
          {emotionalState === 'distracted' && 'Difficulty maintaining focus and attention'}
          {emotionalState === 'balanced' && 'Stable mental state across all dimensions'}
        </div>
      </div>
      
      {/* Mental State Breakdown */}
      <div className="space-y-4 mb-6">
        <h4 className="text-gray-300 font-semibold mb-3">Mental State Analysis</h4>
        
        {Object.entries(mentalState).map(([key, value]) => {
          const getStateColor = (stateKey, stateValue) => {
            if (stateKey === 'stress') {
              return stateValue > 70 ? 'bg-red-500' : 
                     stateValue > 50 ? 'bg-orange-500' : 
                     stateValue > 30 ? 'bg-yellow-500' : 'bg-green-500';
            } else {
              return stateValue > 70 ? 'bg-green-500' : 
                     stateValue > 50 ? 'bg-blue-500' : 
                     stateValue > 30 ? 'bg-orange-500' : 'bg-red-500';
            }
          };

          const getIcon = (stateKey) => {
            switch(stateKey) {
              case 'focus': return <Eye size={16} />;
              case 'creativity': return <Brain size={16} />;
              case 'stress': return <Zap size={16} />;
              case 'energy': return <Activity size={16} />;
              default: return null;
            }
          };

          return (
            <div key={key} className="flex items-center">
              <div className="flex items-center w-20">
                <span className="text-gray-400 mr-2">{getIcon(key)}</span>
                <span className="text-gray-400 text-sm capitalize">{key}:</span>
              </div>
              <div className="flex-1 bg-gray-700 rounded-full h-3 mx-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getStateColor(key, value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <div className="w-12 text-right">
                <span className="text-white text-sm font-mono">{value}%</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Mental Balance</div>
          <div className="text-white font-semibold text-lg">
            {mentalBalance}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                mentalBalance > 70 ? 'bg-green-500' : 
                mentalBalance > 50 ? 'bg-blue-500' : 
                mentalBalance > 30 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${mentalBalance}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Cognitive Load</div>
          <div className={`font-semibold text-lg ${
            cognitiveLoad > 70 ? 'text-red-400' :
            cognitiveLoad > 50 ? 'text-orange-400' : 'text-green-400'
          }`}>
            {cognitiveLoad}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                cognitiveLoad > 70 ? 'bg-red-500' :
                cognitiveLoad > 50 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${cognitiveLoad}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Psychology Insights */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div className="mb-2">
            <strong>Psychology Insight:</strong> {
              consciousnessScore > 80 
                ? "You're in an optimal mental state for peak performance and creative work."
                : consciousnessScore > 60
                ? "Good mental state with room for improvement through stress reduction or focus enhancement."
                : consciousnessScore > 40
                ? "Consider taking breaks, practicing mindfulness, or adjusting your environment."
                : "Your mental state indicates high stress or fatigue. Rest and recovery are recommended."
            }
          </div>
          
          <div>
            <strong>Recommendation:</strong> {
              mentalState.stress > 70
                ? "High stress detected. Try deep breathing exercises or short meditation."
                : mentalState.focus < 40
                ? "Low focus detected. Consider eliminating distractions or taking a short break."
                : mentalState.energy < 30
                ? "Low energy detected. Consider light exercise, hydration, or a healthy snack."
                : "Maintain current state through consistent practices and regular monitoring."
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessMonitor;