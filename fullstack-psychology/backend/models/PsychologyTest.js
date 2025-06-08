// fullstack-psychology/backend/models/PsychologyTest.js - Psychology Test Results Schema
import mongoose from 'mongoose';

const psychologyTestSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        ref: 'Session',
        index: true
    },
    testType: {
        type: String,
        required: true,
        enum: ['reaction_time', 'memory_sequence', 'color_perception', 'attention_span', 'pattern_recognition'],
        index: true
    },
    results: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function(results) {
                // Validate based on test type
                switch (this.testType) {
                    case 'reaction_time':
                        return results.attempts && Array.isArray(results.attempts) && 
                               typeof results.average === 'number';
                    case 'memory_sequence':
                        return results.rounds && Array.isArray(results.rounds) && 
                               typeof results.maxSequence === 'number';
                    case 'color_perception':
                        return results.tests && Array.isArray(results.tests) && 
                               typeof results.correctAnswers === 'number';
                    default:
                        return true;
                }
            },
            message: 'Invalid results format for test type'
        }
    },
    accuracy: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    completionTime: {
        type: Number, // in milliseconds
        required: true,
        min: 0
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        default: 3
    },
    mentalStateAtStart: {
        focus: { type: Number, min: 0, max: 100, required: true },
        creativity: { type: Number, min: 0, max: 100, required: true },
        stress: { type: Number, min: 0, max: 100, required: true },
        energy: { type: Number, min: 0, max: 100, required: true }
    },
    mentalStateAtEnd: {
        focus: { type: Number, min: 0, max: 100, required: true },
        creativity: { type: Number, min: 0, max: 100, required: true },
        stress: { type: Number, min: 0, max: 100, required: true },
        energy: { type: Number, min: 0, max: 100, required: true }
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false, // Using our own timestamp
    collection: 'psychology_tests'
});

// Compound indexes for performance
psychologyTestSchema.index({ sessionId: 1, testType: 1 });
psychologyTestSchema.index({ testType: 1, timestamp: -1 });
psychologyTestSchema.index({ accuracy: -1 });
psychologyTestSchema.index({ timestamp: -1 });

// Virtual for performance score
psychologyTestSchema.virtual('performanceScore').get(function() {
    const baseScore = this.accuracy;
    const timeBonus = this.completionTime < 60000 ? 10 : 0; // Bonus for < 1 minute
    const difficultyMultiplier = 1 + (this.difficulty - 3) * 0.1; // Harder tests worth more
    
    return Math.min(100, Math.round(baseScore * difficultyMultiplier + timeBonus));
});

// Virtual for mental state change
psychologyTestSchema.virtual('mentalStateChange').get(function() {
    const start = this.mentalStateAtStart;
    const end = this.mentalStateAtEnd;
    
    return {
        focus: end.focus - start.focus,
        creativity: end.creativity - start.creativity,
        stress: end.stress - start.stress,
        energy: end.energy - start.energy
    };
});

// Virtual for test efficiency (accuracy per time)
psychologyTestSchema.virtual('efficiency').get(function() {
    return Math.round((this.accuracy / (this.completionTime / 1000)) * 100) / 100;
});

// Static method to find tests by session
psychologyTestSchema.statics.findBySession = function(sessionId) {
    return this.find({ sessionId }).sort({ timestamp: 1 });
};

// Static method to find tests by type
psychologyTestSchema.statics.findByType = function(testType, limit = 50) {
    return this.find({ testType })
        .sort({ timestamp: -1 })
        .limit(limit);
};

// Static method to get test analytics
psychologyTestSchema.statics.getTestAnalytics = function(testType, timeframe = '24h') {
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
        case '1h':
            startTime = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '24h':
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const matchStage = { timestamp: { $gte: startTime } };
    if (testType) {
        matchStage.testType = testType;
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$testType',
                count: { $sum: 1 },
                avgAccuracy: { $avg: '$accuracy' },
                avgCompletionTime: { $avg: '$completionTime' },
                avgDifficulty: { $avg: '$difficulty' },
                bestAccuracy: { $max: '$accuracy' },
                worstAccuracy: { $min: '$accuracy' },
                fastestTime: { $min: '$completionTime' },
                slowestTime: { $max: '$completionTime' }
            }
        },
        {
            $project: {
                testType: '$_id',
                _id: 0,
                count: 1,
                avgAccuracy: { $round: ['$avgAccuracy', 1] },
                avgCompletionTime: { $round: ['$avgCompletionTime', 0] },
                avgDifficulty: { $round: ['$avgDifficulty', 1] },
                bestAccuracy: 1,
                worstAccuracy: 1,
                fastestTime: 1,
                slowestTime: 1
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Static method for leaderboard
psychologyTestSchema.statics.getLeaderboard = function(testType, metric = 'accuracy', limit = 10) {
    const sortField = {};
    sortField[metric] = -1;
    
    return this.find({ testType })
        .sort(sortField)
        .limit(limit)
        .select('sessionId accuracy completionTime difficulty timestamp results');
};

// Static method to calculate improvement trends
psychologyTestSchema.statics.getImprovementTrend = function(sessionId, testType) {
    return this.find({ sessionId, testType })
        .sort({ timestamp: 1 })
        .select('accuracy completionTime timestamp difficulty');
};

// Instance method to calculate reaction time statistics (for reaction tests)
psychologyTestSchema.methods.getReactionStats = function() {
    if (this.testType !== 'reaction_time' || !this.results.attempts) {
        return null;
    }
    
    const attempts = this.results.attempts;
    const sorted = [...attempts].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    
    const variance = attempts.reduce((sum, time) => 
        sum + Math.pow(time - this.results.average, 2), 0) / attempts.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
        count: attempts.length,
        average: this.results.average,
        median: Math.round(median),
        best: this.results.best,
        worst: this.results.worst,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        consistency: this.results.consistency || (1 - (standardDeviation / this.results.average))
    };
};

// Instance method to calculate memory sequence statistics
psychologyTestSchema.methods.getMemoryStats = function() {
    if (this.testType !== 'memory_sequence' || !this.results.rounds) {
        return null;
    }
    
    const rounds = this.results.rounds;
    const correctRounds = rounds.filter(r => r.correct);
    const avgResponseTime = rounds.reduce((sum, r) => sum + r.time, 0) / rounds.length;
    
    return {
        totalRounds: rounds.length,
        correctRounds: correctRounds.length,
        maxSequence: this.results.maxSequence,
        accuracy: (correctRounds.length / rounds.length) * 100,
        avgResponseTime: Math.round(avgResponseTime),
        improvementPattern: this.calculateImprovementPattern(rounds)
    };
};

// Instance method to calculate improvement pattern
psychologyTestSchema.methods.calculateImprovementPattern = function(rounds) {
    if (!rounds || rounds.length < 3) return 'insufficient_data';
    
    const responseTimes = rounds.map(r => r.time);
    const early = responseTimes.slice(0, Math.floor(rounds.length / 2));
    const late = responseTimes.slice(Math.floor(rounds.length / 2));
    
    const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
    const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;
    
    const improvement = (earlyAvg - lateAvg) / earlyAvg;
    
    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'declining';
    return 'stable';
};

// Pre-save middleware to validate test-specific data
psychologyTestSchema.pre('save', function(next) {
    // Ensure accuracy is calculated correctly based on results
    if (this.testType === 'reaction_time' && this.results.attempts) {
        // Reaction time accuracy is based on consistency
        const consistency = this.results.consistency || 0.8;
        this.accuracy = Math.min(100, consistency * 100);
    }
    
    if (this.testType === 'memory_sequence' && this.results.rounds) {
        const correct = this.results.rounds.filter(r => r.correct).length;
        this.accuracy = (correct / this.results.rounds.length) * 100;
    }
    
    if (this.testType === 'color_perception' && this.results.tests) {
        this.accuracy = (this.results.correctAnswers / this.results.tests.length) * 100;
    }
    
    next();
});

// Transform output to include virtuals
psychologyTestSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const PsychologyTest = mongoose.model('PsychologyTest', psychologyTestSchema);

export default PsychologyTest;