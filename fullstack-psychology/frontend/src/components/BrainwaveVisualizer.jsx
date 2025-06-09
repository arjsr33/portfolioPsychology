// fullstack-psychology/frontend/src/components/BrainwaveVisualizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Brain } from 'lucide-react';

const BrainwaveVisualizer = ({ brainwaves, isActive = true, emotionalState }) => {
  const [animationOffset, setAnimationOffset] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Animation loop
  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      setAnimationOffset(prev => (prev + 2) % 1000);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    if (!isActive) {
      // Draw static lines when inactive
      Object.entries(brainwaves).forEach(([type, frequency], index) => {
        const y = (height / 5) * index + (height / 10);
        ctx.strokeStyle = getWaveColor(type);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });
      return;
    }

    // Draw animated waveforms
    Object.entries(brainwaves).forEach(([type, frequency], index) => {
      const color = getWaveColor(type);
      const amplitude = getWaveAmplitude(type, frequency);
      const waveSpeed = frequency * 0.02;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      
      ctx.beginPath();
      
      for (let x = 0; x < width; x += 2) {
        const y = (height / 5) * index + (height / 10) + 
                  Math.sin((x + animationOffset * waveSpeed) * 0.02) * amplitude;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
  }, [brainwaves, animationOffset, isActive]);

  const getWaveColor = (type) => {
    const colors = {
      alpha: '#10B981',   // Green
      beta: '#3B82F6',    // Blue
      theta: '#8B5CF6',   // Purple
      gamma: '#F59E0B',   // Yellow
      delta: '#EF4444'    // Red
    };
    return colors[type] || '#6B7280';
  };

  const getWaveAmplitude = (type, frequency) => {
    const baseAmplitude = frequency / 50 * 20; // Scale based on frequency
    const typeMultipliers = {
      alpha: 1.2,
      beta: 1.0,
      theta: 1.5,
      gamma: 0.8,
      delta: 1.8
    };
    return Math.min(30, baseAmplitude * (typeMultipliers[type] || 1));
  };

  const getWaveDescription = (type) => {
    const descriptions = {
      alpha: 'Relaxed awareness, creativity',
      beta: 'Active concentration, problem solving',
      theta: 'Deep meditation, REM sleep',
      gamma: 'High-level cognitive processing',
      delta: 'Deep sleep, healing'
    };
    return descriptions[type] || '';
  };

  const getWaveRange = (type) => {
    const ranges = {
      alpha: '8-13 Hz',
      beta: '13-30 Hz',
      theta: '4-8 Hz',
      gamma: '30-100 Hz',
      delta: '0.5-4 Hz'
    };
    return ranges[type] || '';
  };

  const getDominantWave = () => {
    const waves = Object.entries(brainwaves);
    const dominant = waves.reduce((max, [type, frequency]) => 
      frequency > max.frequency ? { type, frequency } : max
    , { type: 'alpha', frequency: 0 });
    return dominant.type;
  };

  const getBrainStateDescription = () => {
    const dominant = getDominantWave();
    const descriptions = {
      alpha: 'Relaxed and creative state',
      beta: 'Alert and focused state', 
      theta: 'Meditative and introspective state',
      gamma: 'Peak cognitive performance state',
      delta: 'Deep rest and recovery state'
    };
    return descriptions[dominant] || 'Balanced brain state';
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Activity className="mr-2 text-green-400" size={20} />
          Brainwave Monitor
        </h3>
        <div className="flex items-center">
          {isActive ? (
            <>
              <Zap className="text-green-400 mr-2" size={16} />
              <span className="text-green-400 text-sm">Live</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
              <span className="text-gray-400 text-sm">Paused</span>
            </>
          )}
        </div>
      </div>
      
      {/* Canvas Visualization */}
      <div className="mb-4 bg-gray-900 rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-32 border border-gray-700 rounded"
        />
      </div>
      
      {/* Wave Data */}
      <div className="grid grid-cols-5 gap-2 mb-4 text-sm">
        {Object.entries(brainwaves).map(([type, frequency]) => (
          <div key={type} className="text-center">
            <div 
              className="w-4 h-4 rounded-full mx-auto mb-1"
              style={{ backgroundColor: getWaveColor(type) }}
            />
            <div className="text-gray-400 uppercase text-xs font-semibold">
              {type}
            </div>
            <div 
              className="font-mono font-bold text-sm"
              style={{ color: getWaveColor(type) }}
            >
              {frequency.toFixed(1)}
            </div>
            <div className="text-gray-500 text-xs">
              {getWaveRange(type)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Brain State Summary */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Brain className="text-purple-400 mr-2" size={16} />
            <span className="text-gray-300 font-semibold">Brain State</span>
          </div>
          <span className="text-purple-400 text-sm font-semibold">
            {getDominantWave().toUpperCase()} Dominant
          </span>
        </div>
        
        <div className="text-gray-400 text-sm">
          {getBrainStateDescription()}
        </div>
        
        {emotionalState && (
          <div className="mt-2 text-xs text-gray-500">
            Current emotional state: <span className="text-cyan-400 capitalize">
              {emotionalState.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>
      
      {/* Wave Details */}
      <div className="space-y-2">
        <h4 className="text-gray-300 font-semibold text-sm mb-3">Wave Analysis</h4>
        {Object.entries(brainwaves).map(([type, frequency]) => (
          <div key={type} className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getWaveColor(type) }}
              />
              <span className="text-gray-400 capitalize w-12">{type}:</span>
            </div>
            <div className="flex-1 mx-2">
              <div className="text-gray-500 text-xs">
                {getWaveDescription(type)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono" style={{ color: getWaveColor(type) }}>
                {frequency.toFixed(1)} Hz
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Coherence Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Brainwave Coherence:</span>
          <div className="flex items-center">
            {(() => {
              const totalWaves = Object.values(brainwaves).reduce((a, b) => a + b, 0);
              const avgWave = totalWaves / 5;
              const variance = Object.values(brainwaves)
                .reduce((sum, wave) => sum + Math.pow(wave - avgWave, 2), 0) / 5;
              const coherence = Math.max(0, Math.min(100, 100 - (variance * 2)));
              
              return (
                <>
                  <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{ width: `${coherence}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {Math.round(coherence)}%
                  </span>
                </>
              );
            })()}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Higher coherence indicates more synchronized brain activity
        </div>
      </div>
    </div>
  );
};

export default BrainwaveVisualizer;