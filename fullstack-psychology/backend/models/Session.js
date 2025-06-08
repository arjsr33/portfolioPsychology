// fullstack-psychology/backend/models/Session.js - Session Schema
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        maxlength: 100
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    userAgent: {
        type: String,
        required: true,
        maxlength: 500
    },
    mentalState: {
        focus: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            default: 50
        },
        creativity: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            default: 50
        },
        stress: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            default: 50
        },
        energy: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            default: 50
        }
    },
    interactions: {
        type: Number,
        default: 0,
        min: 0
    },
    duration: {
        type: Number, // in milliseconds
        default: 0,
        min: 0
    },
    totalTests: {
        type: Number,
        default: 0,
        min: 0
    },
    avgPerformance: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    location: {
        country: {
            type: String,
            maxlength: 2,
            uppercase: true,
            default: null
        },
        timezone: {
            type: String,
            maxlength: 50,
            default: null
        }
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'sessions'
});

// Indexes for performance
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ endTime: -1 });
sessionSchema.index({ 'mentalState.focus': -1 });
sessionSchema.index({ 'mentalState.creativity': -1 });
sessionSchema.index({ duration: -1 });

// Virtual for session duration calculation
sessionSchema.virtual('calculatedDuration').get(function() {
    if (this.endTime && this.startTime) {
        return this.endTime.getTime() - this.startTime.getTime();
    }
    return this.duration;
});

// Virtual for session status
sessionSchema.virtual('status').get(function() {
    if (!this.endTime) {
        return 'active';
    }
    return 'completed';
});

// Virtual for mental balance score
sessionSchema.virtual('mentalBalance').get(function() {
    const { focus, creativity, stress, energy } = this.mentalState;
    return Math.round((focus + creativity + energy + (100 - stress)) / 4);
});

// Instance method to end session
sessionSchema.methods.endSession = function() {
    this.endTime = new Date();
    this.duration = this.endTime.getTime() - this.startTime.getTime();
    return this.save();
};

// Instance method to update mental state
sessionSchema.methods.updateMentalState = function(newState) {
    Object.assign(this.mentalState, newState);
    return this.save();
};

// Instance method to increment interactions
sessionSchema.methods.addInteraction = function() {
    this.interactions += 1;
    return this.save();
};

// Static method to find active sessions
sessionSchema.statics.findActiveSessions = function() {
    return this.find({ endTime: null });
};

// Static method to find sessions by date range
sessionSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ createdAt: -1 });
};

// Static method to get analytics
sessionSchema.statics.getAnalytics = function(timeframe = '24h') {
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
        case '1h':
            startDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                avgFocus: { $avg: '$mentalState.focus' },
                avgCreativity: { $avg: '$mentalState.creativity' },
                avgStress: { $avg: '$mentalState.stress' },
                avgEnergy: { $avg: '$mentalState.energy' },
                avgDuration: { $avg: '$duration' },
                totalInteractions: { $sum: '$interactions' },
                avgPerformance: { $avg: '$avgPerformance' }
            }
        },
        {
            $project: {
                _id: 0,
                totalSessions: 1,
                avgFocus: { $round: ['$avgFocus', 1] },
                avgCreativity: { $round: ['$avgCreativity', 1] },
                avgStress: { $round: ['$avgStress', 1] },
                avgEnergy: { $round: ['$avgEnergy', 1] },
                avgDuration: { $round: ['$avgDuration', 0] },
                totalInteractions: 1,
                avgPerformance: { $round: ['$avgPerformance', 1] }
            }
        }
    ]);
};

// Pre-save middleware to calculate performance
sessionSchema.pre('save', function(next) {
    // Calculate average performance if we have test results
    if (this.totalTests > 0 && this.avgPerformance === null) {
        // This would typically be calculated from related test documents
        // For now, estimate based on mental state
        const balance = this.mentalBalance;
        this.avgPerformance = Math.min(100, Math.max(0, balance + (Math.random() - 0.5) * 20));
    }
    
    next();
});

// Pre-remove middleware to clean up related documents
sessionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        // Remove related consciousness and test data
        await mongoose.model('Consciousness').deleteMany({ sessionId: this.sessionId });
        await mongoose.model('PsychologyTest').deleteMany({ sessionId: this.sessionId });
        await mongoose.model('BrainwaveData').deleteMany({ sessionId: this.sessionId });
        next();
    } catch (error) {
        next(error);
    }
});

// Transform output to include virtuals
sessionSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;