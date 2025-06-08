// fullstack-psychology/backend/models/Consciousness.js - Consciousness Data Schema
import mongoose from 'mongoose';

const consciousnessSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        ref: 'Session',
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    mentalState: {
        focus: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        creativity: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        stress: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        energy: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        }
    },
    brainwaves: {
        alpha: {
            type: Number,
            min: 0,
            max: 20,
            required: true,
            default: 10 // Default 10 Hz
        },
        beta: {
            type: Number,
            min: 0,
            max: 40,
            required: true,
            default: 20 // Default 20 Hz
        },
        theta: {
            type: Number,
            min: 0,
            max: 15,
            required: true,
            default: 6 // Default 6 Hz
        },
        gamma: {
            type: Number,
            min: 20,
            max: 100,
            required: true,
            default: 40 // Default 40 Hz
        },
        delta: {
            type: Number,
            min: 0,
            max: 5,
            required: true,
            default: 2 // Default 2 Hz
        }
    },
    cognitiveLoad: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
        default: 50
    },
    attentionLevel: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
        default: 50
    },
    emotionalState: {
        type: String,
        enum: [
            'relaxed',
            'focused',
            'creative',
            'energetic',
            'stressed',
            'flow_state',
            'focused_creative',
            'highly_creative',
            'active_concentration',
            'relaxed_focus',
            'peak_performance',
            'distracted',
            'overwhelmed'
        ],
        required: true,
        default: 'relaxed'
    },
    environmentalFactors: {
        timeOfDay: {
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'night'],
            required: true
        },
        sessionProgress: {
            type: Number,
            min: 0,
            max: 1,
            required: true,
            default: 0
        }
    }
}, {
    timestamps: false, // We use our own timestamp field
    collection: 'consciousness'
});

// Compound indexes for performance
consciousnessSchema.index({ sessionId: 1, timestamp: -1 });
consciousnessSchema.index({ timestamp: -1 });
consciousnessSchema.index({ emotionalState: 1, timestamp: -1 });
consciousnessSchema.index({ 'mentalState.focus': -1 });
consciousnessSchema.index({ cognitiveLoad: -1 });

// Virtual for overall mental balance
consciousnessSchema.virtual('mentalBalance').get(function() {
    const { focus, creativity, stress, energy } = this.mentalState;
    return Math.round((focus + creativity + energy + (100 - stress)) / 4);
});

// Virtual for dominant brainwave
consciousnessSchema.virtual('dominantBrainwave').get(function() {
    const waves = this.brainwaves;
    const dominant = Object.entries(waves).reduce((max, [key, value]) => {
        return value > max.value ? { wave: key, value } : max;
    }, { wave: 'alpha', value: 0 });
    
    return dominant.wave;
});

// Virtual for brainwave coherence (simplified calculation)
consciousnessSchema.virtual('brainwaveCoherence').get(function() {
    const { alpha, beta, theta, gamma, delta } = this.brainwaves;
    const total = alpha + beta + theta + gamma + delta;
    const variance = [alpha, beta, theta, gamma, delta]
        .map(wave => Math.pow(wave - (total / 5), 2))
        .reduce((sum, val) => sum + val, 0) / 5;
    
    // Return coherence as percentage (inverse of variance)
    return Math.max(0, Math.min(100, 100 - (variance * 2)));
});

// Static method to find by session
consciousnessSchema.statics.findBySession = function(sessionId, limit = 50) {
    return this.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(limit);
};

// Static method to get latest consciousness data
consciousnessSchema.statics.getLatest = function(sessionId) {
    return this.findOne({ sessionId }).sort({ timestamp: -1 });
};

// Static method to get time series data
consciousnessSchema.statics.getTimeSeries = function(sessionId, startTime, endTime) {
    const query = { sessionId };
    
    if (startTime || endTime) {
        query.timestamp = {};
        if (startTime) query.timestamp.$gte = new Date(startTime);
        if (endTime) query.timestamp.$lte = new Date(endTime);
    }
    
    return this.find(query).sort({ timestamp: 1 });
};

// Static method to get consciousness analytics
consciousnessSchema.statics.getAnalytics = function(sessionId, timeframe = '1h') {
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
        case '15m':
            startTime = new Date(now.getTime() - 15 * 60 * 1000);
            break;
        case '1h':
            startTime = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '24h':
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        default:
            startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }
    
    const matchStage = { timestamp: { $gte: startTime } };
    if (sessionId) {
        matchStage.sessionId = sessionId;
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                avgFocus: { $avg: '$mentalState.focus' },
                avgCreativity: { $avg: '$mentalState.creativity' },
                avgStress: { $avg: '$mentalState.stress' },
                avgEnergy: { $avg: '$mentalState.energy' },
                avgCognitiveLoad: { $avg: '$cognitiveLoad' },
                avgAttentionLevel: { $avg: '$attentionLevel' },
                avgAlpha: { $avg: '$brainwaves.alpha' },
                avgBeta: { $avg: '$brainwaves.beta' },
                avgTheta: { $avg: '$brainwaves.theta' },
                avgGamma: { $avg: '$brainwaves.gamma' },
                avgDelta: { $avg: '$brainwaves.delta' },
                emotionalStates: { $push: '$emotionalState' }
            }
        },
        {
            $project: {
                _id: 0,
                count: 1,
                mentalState: {
                    focus: { $round: ['$avgFocus', 1] },
                    creativity: { $round: ['$avgCreativity', 1] },
                    stress: { $round: ['$avgStress', 1] },
                    energy: { $round: ['$avgEnergy', 1] }
                },
                brainwaves: {
                    alpha: { $round: ['$avgAlpha', 1] },
                    beta: { $round: ['$avgBeta', 1] },
                    theta: { $round: ['$avgTheta', 1] },
                    gamma: { $round: ['$avgGamma', 1] },
                    delta: { $round: ['$avgDelta', 1] }
                },
                cognitiveLoad: { $round: ['$avgCognitiveLoad', 1] },
                attentionLevel: { $round: ['$avgAttentionLevel', 1] },
                emotionalStates: 1
            }
        }
    ]);
};

// Static method to calculate consciousness score
consciousnessSchema.statics.calculateConsciousnessScore = function(mentalState, brainwaves) {
    const { focus, creativity, stress, energy } = mentalState;
    const { alpha, beta, theta, gamma } = brainwaves;
    
    // Base score from mental state (weighted)
    const mentalScore = (
        focus * 0.3 +           // Focus is important
        creativity * 0.25 +     // Creativity adds value
        energy * 0.2 +          // Energy supports performance
        (100 - stress) * 0.25   // Low stress is beneficial
    );
    
    // Brainwave contribution (optimal ranges)
    const brainwaveScore = (
        Math.min(alpha / 12, 1) * 25 +     // Optimal alpha: 8-12 Hz
        Math.min(beta / 25, 1) * 30 +      // Optimal beta: 13-25 Hz
        Math.min(theta / 8, 1) * 20 +      // Optimal theta: 4-8 Hz
        Math.min(gamma / 50, 1) * 25       // Optimal gamma: 30-50 Hz
    );
    
    // Combine scores (70% mental state, 30% brainwaves)
    const totalScore = (mentalScore * 0.7) + (brainwaveScore * 0.3);
    
    return Math.round(Math.min(100, Math.max(0, totalScore)));
};

// Instance method to determine emotional state
consciousnessSchema.methods.determineEmotionalState = function() {
    const { focus, creativity, stress, energy } = this.mentalState;
    const balance = this.mentalBalance;
    
    // High performance states
    if (focus > 80 && creativity > 80 && stress < 30) {
        return 'peak_performance';
    }
    if (focus > 70 && creativity > 70 && stress < 40) {
        return 'flow_state';
    }
    
    // Creative states
    if (creativity > 80 && stress < 40) {
        return 'highly_creative';
    }
    if (creativity > 60 && focus > 60) {
        return 'focused_creative';
    }
    
    // Focus states
    if (focus > 70 && stress < 50) {
        return 'active_concentration';
    }
    if (focus > 60 && stress < 30) {
        return 'relaxed_focus';
    }
    
    // Energy states
    if (energy > 70 && stress < 40) {
        return 'energetic';
    }
    
    // Stress states
    if (stress > 70) {
        return 'overwhelmed';
    }
    if (stress > 50 && focus < 40) {
        return 'stressed';
    }
    
    // Attention states
    if (focus < 30 && energy < 40) {
        return 'distracted';
    }
    
    // Default states
    if (balance > 60) {
        return 'focused';
    }
    if (stress < 30) {
        return 'relaxed';
    }
    
    return 'creative';
};

// Pre-save middleware to auto-determine emotional state
consciousnessSchema.pre('save', function(next) {
    if (!this.emotionalState || this.emotionalState === 'relaxed') {
        this.emotionalState = this.determineEmotionalState();
    }
    next();
});

// Transform output to include virtuals
consciousnessSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Consciousness = mongoose.model('Consciousness', consciousnessSchema);

export default Consciousness;