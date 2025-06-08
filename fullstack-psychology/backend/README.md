# Psychology Portfolio Backend

**Node.js + Express + MongoDB backend for Interactive Psychology demonstration**

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local) OR MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd fullstack-psychology/backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Database Setup**
   - **Option A: Local MongoDB**
     ```bash
     # Make sure MongoDB is running locally
     # Default connection: mongodb://localhost:27017/psychology_portfolio
     ```
   
   - **Option B: MongoDB Atlas**
     ```bash
     # Update .env with your Atlas connection string:
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/psychology_portfolio
     ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Visit Demo**
   - Backend Demo: http://localhost:3001/demo
   - API Documentation: http://localhost:3001/demo/api
   - Health Check: http://localhost:3001/health

## 📊 Database Structure

Our MongoDB database contains psychology portfolio demonstration data:

### Collections

#### `sessions`
User consciousness sessions
```javascript
{
  sessionId: "sess_demo_001",
  userAgent: "Mozilla/5.0...",
  mentalState: {
    focus: 75,      // 0-100
    creativity: 68, // 0-100  
    stress: 32,     // 0-100
    energy: 82      // 0-100
  },
  interactions: 47,
  duration: 930000, // milliseconds
  location: { country: "US", timezone: "America/New_York" }
}
```

#### `consciousness`
Real-time mental state snapshots
```javascript
{
  sessionId: "sess_demo_001",
  timestamp: ISODate("2024-01-15T10:32:15.000Z"),
  mentalState: { focus: 73, creativity: 65, stress: 35, energy: 79 },
  brainwaves: {
    alpha: 9.2,    // 8-13 Hz
    beta: 18.5,    // 13-30 Hz  
    theta: 6.8,    // 4-8 Hz
    gamma: 42.1,   // 30-100 Hz
    delta: 2.3     // 0.5-4 Hz
  },
  cognitiveLoad: 65,
  emotionalState: "focused_creative"
}
```

#### `psychology_tests`
Cognitive test results
```javascript
{
  sessionId: "sess_demo_001",
  testType: "reaction_time", // "memory_sequence", "color_perception"
  results: {
    attempts: [245, 198, 223, 187, 201],
    average: 210.8,
    best: 187,
    consistency: 0.82
  },
  accuracy: 85, // percentage
  difficulty: 3 // 1-5 scale
}
```

## 🛠 API Endpoints

### Consciousness API (`/api/consciousness`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/session` | Create new consciousness session |
| GET | `/session/:id` | Get session details and history |
| PUT | `/session/:id/state` | Update mental state |
| GET | `/session/:id/brainwaves` | Get brainwave data |
| POST | `/record` | Create consciousness record |
| GET | `/analytics` | Get consciousness analytics |

### Psychology API (`/api/psychology`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tests/reaction` | Submit reaction time test |
| POST | `/tests/memory` | Submit memory sequence test |
| POST | `/tests/color` | Submit color perception test |
| GET | `/tests/:type` | Get tests by type |
| GET | `/session/:id/tests` | Get all tests for session |
| GET | `/analytics` | Get psychology analytics |
| GET | `/stats/overview` | Get comprehensive overview |

### Demo Routes (`/demo`)

| Endpoint | Description |
|----------|-------------|
| `/demo` | Main backend demonstration |
| `/demo/api` | Interactive API testing |
| `/demo/database` | Database operations viewer |
| `/demo/psychology` | Algorithm demonstrations |
| `/demo/analytics` | Real-time analytics |

## 🧠 Psychology Algorithms

### Consciousness Score Calculation
```javascript
function calculateConsciousnessScore(mentalState, brainwaves) {
  // Mental state component (70% weight)
  const mentalScore = (
    focus * 0.3 +           // Focus importance
    creativity * 0.25 +     // Creative contribution  
    energy * 0.2 +          // Energy support
    (100 - stress) * 0.25   // Low stress benefit
  );
  
  // Brainwave optimization (30% weight)
  const brainwaveScore = (
    Math.min(alpha / 12, 1) * 25 +     // Optimal alpha: 8-12 Hz
    Math.min(beta / 25, 1) * 30 +      // Optimal beta: 13-25 Hz  
    Math.min(theta / 8, 1) * 20 +      // Optimal theta: 4-8 Hz
    Math.min(gamma / 50, 1) * 25       // Optimal gamma: 30-50 Hz
  );
  
  return (mentalScore * 0.7) + (brainwaveScore * 0.3);
}
```

### Brainwave Generation
```javascript
// Generate realistic brainwaves from mental state
brainwaves: {
  alpha: 8 + (creativity / 100) * 5,        // Relaxed awareness
  beta: 13 + (focus / 100) * 17,            // Active concentration
  theta: 4 + ((100 - stress) / 100) * 4,    // Creativity/meditation
  gamma: 30 + ((focus + creativity) / 200) * 70, // High-level processing
  delta: 1 + Math.random() * 2              // Deep sleep (minimal)
}
```

### Emotional State Mapping
```javascript
// Determine emotional state from mental state
if (focus > 80 && creativity > 80 && stress < 30) return 'peak_performance';
if (focus > 70 && creativity > 70 && stress < 40) return 'flow_state';  
if (creativity > 80 && stress < 40) return 'highly_creative';
if (stress > 70) return 'overwhelmed';
// ... additional mappings
```

## 🔧 Architecture Features

### Database Integration
- **MongoDB with Mongoose ODM**
- **Advanced schema validation**
- **Optimized indexes for performance**
- **Aggregation pipelines for analytics**

### API Design
- **RESTful endpoint structure**
- **Comprehensive input validation (Joi)**
- **Consistent error handling**
- **Detailed API documentation**

### Performance & Security
- **Rate limiting (100 req/15min)**
- **Request compression**
- **CORS configuration**
- **Security headers (Helmet)**
- **Performance monitoring**

### Logging & Monitoring
- **Winston comprehensive logging**
- **Request/response tracking**
- **Performance metrics**
- **Error categorization**

## 📈 Demo Features

### Live Backend Demonstration
- **Interactive API testing**
- **Real-time database operations**
- **Algorithm visualizations**
- **Performance monitoring**

### Portfolio Capabilities
- **Complex data modeling**
- **Real-time analytics**
- **Psychology algorithm implementation**
- **Production-ready architecture**

## 🚦 API Testing

### Test Session Creation
```bash
curl -X POST http://localhost:3001/api/consciousness/session \
  -H "Content-Type: application/json" \
  -d '{
    "userAgent": "API Test",
    "mentalState": {
      "focus": 75,
      "creativity": 68, 
      "stress": 32,
      "energy": 82
    }
  }'
```

### Test Analytics
```bash
curl http://localhost:3001/api/analytics?timeframe=24h
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 📦 Scripts

```bash
npm run dev        # Development server with nodemon
npm start          # Production server
npm test           # Run test suite
npm run lint       # ESLint code checking
npm run format     # Prettier code formatting
```

## 🌐 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=your_mongodb_atlas_connection_string
```

### Production Considerations
- Set `NODE_ENV=production`
- Use MongoDB Atlas for database
- Configure proper CORS origins
- Enable rate limiting
- Set up monitoring and logging

## 🎯 Portfolio Value

This backend demonstrates:

1. **Full-Stack Competency** - Complete REST API implementation
2. **Database Expertise** - Advanced MongoDB operations and modeling
3. **Algorithm Development** - Custom psychology calculation engines
4. **Performance Optimization** - Efficient queries and caching
5. **Production Architecture** - Scalable, maintainable codebase
6. **Documentation Skills** - Comprehensive API documentation

## 🔗 Integration

### Frontend Connection
```javascript
// Frontend API client example
const response = await fetch('http://localhost:3001/api/consciousness/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sessionData)
});
```

### Database Queries
```javascript
// Example aggregation pipeline
const analytics = await Session.aggregate([
  { $match: { createdAt: { $gte: startDate } } },
  { $group: { 
    _id: null, 
    avgFocus: { $avg: '$mentalState.focus' },
    totalSessions: { $sum: 1 }
  }}
]);
```

---

**Backend powered by Node.js + Express + MongoDB | Portfolio demonstration of full-stack development capabilities**