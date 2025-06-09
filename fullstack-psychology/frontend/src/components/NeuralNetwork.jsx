// fullstack-psychology/frontend/src/components/NeuralNetwork.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Cpu, Zap } from 'lucide-react';

const NeuralNetwork = ({ isActive = true, consciousnessScore, mentalState, connections = 12 }) => {
  const [nodes, setNodes] = useState([]);
  const [pulseAnimation, setPulseAnimation] = useState(0);
  const svgRef = useRef(null);
  const animationRef = useRef(null);

  // Generate neural network structure
  useEffect(() => {
    const generateNodes = () => {
      const newNodes = [];
      
      // Input layer (4 nodes - representing mental state components)
      for (let i = 0; i < 4; i++) {
        newNodes.push({
          id: `input-${i}`,
          x: 50,
          y: 50 + (i * 40),
          layer: 'input',
          type: ['focus', 'creativity', 'stress', 'energy'][i],
          active: Math.random() > 0.3,
          activation: Object.values(mentalState)[i] / 100
        });
      }
      
      // Hidden layer 1 (6 nodes)
      for (let i = 0; i < 6; i++) {
        newNodes.push({
          id: `hidden1-${i}`,
          x: 150,
          y: 30 + (i * 30),
          layer: 'hidden1',
          type: 'processing',
          active: Math.random() > 0.4,
          activation: Math.random()
        });
      }
      
      // Hidden layer 2 (4 nodes)
      for (let i = 0; i < 4; i++) {
        newNodes.push({
          id: `hidden2-${i}`,
          x: 250,
          y: 50 + (i * 40),
          layer: 'hidden2',
          type: 'integration',
          active: Math.random() > 0.4,
          activation: Math.random()
        });
      }
      
      // Output layer (3 nodes - representing consciousness aspects)
      for (let i = 0; i < 3; i++) {
        newNodes.push({
          id: `output-${i}`,
          x: 350,
          y: 60 + (i * 40),
          layer: 'output',
          type: ['consciousness', 'emotion', 'cognition'][i],
          active: Math.random() > 0.2,
          activation: [consciousnessScore/100, Math.random(), Math.random()][i]
        });
      }
      
      return newNodes;
    };

    setNodes(generateNodes());
  }, [mentalState, consciousnessScore]);

  // Animation loop
  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      setPulseAnimation(prev => (prev + 0.05) % (Math.PI * 2));
      
      // Update node activations
      setNodes(prevNodes => prevNodes.map(node => {
        if (node.layer === 'input') {
          // Input nodes reflect mental state
          const stateValues = Object.values(mentalState);
          const index = parseInt(node.id.split('-')[1]);
          return {
            ...node,
            activation: stateValues[index] / 100,
            active: stateValues[index] > 30
          };
        } else if (node.layer === 'output' && node.type === 'consciousness') {
          // Consciousness output reflects score
          return {
            ...node,
            activation: consciousnessScore / 100,
            active: consciousnessScore > 40
          };
        } else {
          // Hidden and other nodes have dynamic activation
          return {
            ...node,
            active: Math.random() > 0.3,
            activation: Math.random() * 0.8 + 0.2
          };
        }
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, mentalState, consciousnessScore]);

  const getNodeColor = (node) => {
    if (!node.active) return '#374151';
    
    const intensity = node.activation;
    
    switch (node.layer) {
      case 'input':
        const inputColors = {
          focus: `rgba(59, 130, 246, ${intensity})`, // Blue
          creativity: `rgba(139, 92, 246, ${intensity})`, // Purple
          stress: `rgba(239, 68, 68, ${intensity})`, // Red
          energy: `rgba(249, 115, 22, ${intensity})` // Orange
        };
        return inputColors[node.type] || `rgba(107, 114, 128, ${intensity})`;
      
      case 'hidden1':
      case 'hidden2':
        return `rgba(16, 185, 129, ${intensity})`; // Green
      
      case 'output':
        const outputColors = {
          consciousness: `rgba(236, 72, 153, ${intensity})`, // Pink
          emotion: `rgba(245, 158, 11, ${intensity})`, // Yellow
          cognition: `rgba(99, 102, 241, ${intensity})` // Indigo
        };
        return outputColors[node.type] || `rgba(107, 114, 128, ${intensity})`;
      
      default:
        return `rgba(107, 114, 128, ${intensity})`;
    }
  };

  const getNodeRadius = (node) => {
    const baseRadius = node.layer === 'input' || node.layer === 'output' ? 8 : 6;
    const pulseEffect = isActive && node.active ? Math.sin(pulseAnimation + node.id.length) * 2 : 0;
    return baseRadius + pulseEffect + (node.activation * 3);
  };

  const generateConnections = () => {
    const connections = [];
    
    // Connect input to hidden1
    nodes.filter(n => n.layer === 'input').forEach(inputNode => {
      nodes.filter(n => n.layer === 'hidden1').forEach(hiddenNode => {
        if (Math.random() > 0.3) { // Not all connections exist
          connections.push({
            from: inputNode,
            to: hiddenNode,
            weight: Math.random(),
            active: inputNode.active && hiddenNode.active
          });
        }
      });
    });
    
    // Connect hidden1 to hidden2
    nodes.filter(n => n.layer === 'hidden1').forEach(h1Node => {
      nodes.filter(n => n.layer === 'hidden2').forEach(h2Node => {
        if (Math.random() > 0.4) {
          connections.push({
            from: h1Node,
            to: h2Node,
            weight: Math.random(),
            active: h1Node.active && h2Node.active
          });
        }
      });
    });
    
    // Connect hidden2 to output
    nodes.filter(n => n.layer === 'hidden2').forEach(hiddenNode => {
      nodes.filter(n => n.layer === 'output').forEach(outputNode => {
        if (Math.random() > 0.2) {
          connections.push({
            from: hiddenNode,
            to: outputNode,
            weight: Math.random(),
            active: hiddenNode.active && outputNode.active
          });
        }
      });
    });
    
    return connections;
  };

  const connections_list = generateConnections();

  const getLayerInfo = () => {
    const layerStats = {
      input: { count: 0, active: 0 },
      hidden1: { count: 0, active: 0 },
      hidden2: { count: 0, active: 0 },
      output: { count: 0, active: 0 }
    };

    nodes.forEach(node => {
      if (layerStats[node.layer]) {
        layerStats[node.layer].count++;
        if (node.active) layerStats[node.layer].active++;
      }
    });

    return layerStats;
  };

  const layerStats = getLayerInfo();
  const networkActivity = nodes.filter(n => n.active).length / nodes.length;

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Brain className="mr-2 text-purple-400" size={20} />
          Neural Network
        </h3>
        <div className="flex items-center">
          {isActive ? (
            <>
              <Zap className="text-green-400 mr-2" size={16} />
              <span className="text-green-400 text-sm">Processing</span>
            </>
          ) : (
            <>
              <Cpu className="text-gray-400 mr-2" size={16} />
              <span className="text-gray-400 text-sm">Idle</span>
            </>
          )}
        </div>
      </div>
      
      {/* Network Visualization */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <svg 
          ref={svgRef}
          width="400" 
          height="220" 
          viewBox="0 0 400 220" 
          className="w-full"
        >
          {/* Connections */}
          {connections_list.map((connection, index) => (
            <line
              key={index}
              x1={connection.from.x}
              y1={connection.from.y}
              x2={connection.to.x}
              y2={connection.to.y}
              stroke={connection.active ? '#EC4899' : '#374151'}
              strokeWidth={connection.active ? connection.weight * 2 + 0.5 : 1}
              opacity={connection.active ? connection.weight * 0.8 + 0.2 : 0.2}
            />
          ))}
          
          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={getNodeRadius(node)}
                fill={getNodeColor(node)}
                stroke="#1F2937"
                strokeWidth="2"
              />
              {/* Node labels for input and output */}
              {(node.layer === 'input' || node.layer === 'output') && (
                <text
                  x={node.layer === 'input' ? node.x - 30 : node.x + 20}
                  y={node.y + 4}
                  fill="#9CA3AF"
                  fontSize="10"
                  textAnchor={node.layer === 'input' ? 'end' : 'start'}
                >
                  {node.type}
                </text>
              )}
            </g>
          ))}
          
          {/* Layer labels */}
          <text x="50" y="20" fill="#9CA3AF" fontSize="12" textAnchor="middle">Input</text>
          <text x="150" y="20" fill="#9CA3AF" fontSize="12" textAnchor="middle">Hidden 1</text>
          <text x="250" y="20" fill="#9CA3AF" fontSize="12" textAnchor="middle">Hidden 2</text>
          <text x="350" y="20" fill="#9CA3AF" fontSize="12" textAnchor="middle">Output</text>
        </svg>
      </div>
      
      {/* Network Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-400 text-sm">Network Activity</div>
          <div className="text-white font-semibold text-lg">
            {Math.round(networkActivity * 100)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${networkActivity * 100}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-400 text-sm">Active Connections</div>
          <div className="text-white font-semibold text-lg">
            {connections_list.filter(c => c.active).length}
          </div>
          <div className="text-gray-500 text-xs">
            of {connections_list.length} total
          </div>
        </div>
      </div>
      
      {/* Layer Information */}
      <div className="space-y-2">
        <h4 className="text-gray-300 font-semibold text-sm">Layer Analysis</h4>
        
        {Object.entries(layerStats).map(([layer, stats]) => (
          <div key={layer} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                layer === 'input' ? 'bg-blue-500' :
                layer.includes('hidden') ? 'bg-green-500' : 'bg-pink-500'
              }`} />
              <span className="text-gray-400 capitalize w-16">{layer}:</span>
            </div>
            <div className="text-white">
              {stats.active}/{stats.count} active
            </div>
            <div className="w-16 bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${
                  layer === 'input' ? 'bg-blue-500' :
                  layer.includes('hidden') ? 'bg-green-500' : 'bg-pink-500'
                }`}
                style={{ width: `${(stats.active / stats.count) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Network Insights */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div className="mb-2">
            <strong>Network State:</strong> {
              networkActivity > 0.8 
                ? "Highly active - peak cognitive processing"
                : networkActivity > 0.6
                ? "Active - good information flow"
                : networkActivity > 0.4
                ? "Moderate - standard processing"
                : "Low activity - resting state"
            }
          </div>
          
          <div>
            <strong>Information Flow:</strong> {
              consciousnessScore > 80
                ? "Optimal neural communication and integration"
                : consciousnessScore > 60
                ? "Good information processing with minor bottlenecks"
                : "Reduced efficiency - consider optimizing mental state"
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetwork;