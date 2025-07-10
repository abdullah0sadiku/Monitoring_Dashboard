# Monitor Dashboard - GenAI API Implementation Guide

## 1. Project Overview

The Monitor Dashboard is an AI-powered scraper management system that allows users to:
- Monitor web scrapers in real-time
- Detect broken scrapers automatically
- Generate AI-powered fixes for broken monitors
- Deploy fixes through automated pull requests
- Manage repositories and configurations

### Key Features
- **Real-time Dashboard**: Visual monitoring of scraper health
- **AI-Powered Fixes**: Automated code generation to fix broken scrapers
- **Repository Management**: GitHub/GitLab integration for deployments
- **Role-based Authentication**: Admin and Operator roles
- **Code Comparison**: Side-by-side view of old vs new code
- **Deployment Pipeline**: Automated PR creation and deployment

## 2. Current Architecture

### Frontend (React.js)
- **Framework**: React 18 with React Router
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Key Components**:
  - Dashboard: Main monitoring interface
  - ScraperFixDetail: AI fix generation interface
  - AiFixReview: Code comparison and deployment
  - MonitorForm: Monitor configuration
  - RepositoryConfig: Repository management

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Database**: SQLite (configurable to MongoDB)
- **Security**: Helmet, CORS, compression
- **Architecture**: RESTful API with modular routing

## 3. Frontend Components Architecture

### Main Application Flow
```
Login → Dashboard → Broken Scrapers List → Fix Detail → AI Review → Confirmation
```

### Key Components for GenAI Integration

#### 3.1 ScraperFixDetail Component
**Location**: `src/components/ScraperFixDetail.js`
**Purpose**: The "magic button" interface for AI fix generation
**Key Features**:
- Display problem analysis
- Trigger AI fix generation
- Show loading states during processing
- Error handling and user feedback

#### 3.2 AiFixReview Component
**Location**: `src/components/AiFixReview.js`
**Purpose**: Code comparison and deployment approval
**Key Features**:
- Side-by-side code comparison
- AI solution explanation
- Validation status display
- Deployment controls

#### 3.3 AIService
**Location**: `src/services/aiService.js`
**Purpose**: Frontend service for AI API communication
**Current Status**: Mock implementation - needs real API integration

## 4. Backend API Structure

### Current API Endpoints

#### 4.1 Monitor Management
- `GET /api/monitors` - List all monitors
- `POST /api/monitors` - Create new monitor
- `PUT /api/monitors/:id` - Update monitor
- `DELETE /api/monitors/:id` - Delete monitor

#### 4.2 Repository Management
- `GET /api/repositories` - List repositories
- `POST /api/repositories` - Add repository
- `PUT /api/repositories/:id` - Update repository

#### 4.3 Deployment Management
- `GET /api/deployments` - List deployments
- `POST /api/deployments` - Create deployment

#### 4.4 AI Endpoints (REQUIRES IMPLEMENTATION)
**Location**: `backend/src/routes/ai.js`
**Status**: Placeholder endpoints - need real implementation

## 5. GenAI Integration Requirements

### 5.1 Core AI Endpoints to Implement

#### POST /api/ai/generate-fix
**Purpose**: Generate AI-powered fix for broken monitor
**Request Body**:
```json
{
  "monitorId": "string",
  "errorData": {
    "errorSummary": "string",
    "lastAction": "string",
    "monitorType": "string",
    "stackTrace": "string", // optional
    "screenshot": "base64", // optional
    "pageHtml": "string" // optional
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "code": "string", // Generated fix code
    "explanation": "string", // Human-readable explanation
    "confidence": 0.95, // AI confidence score
    "estimatedTime": "string", // Estimated fix time
    "changes": [
      {
        "type": "selector_update",
        "old": "string",
        "new": "string",
        "reason": "string"
      }
    ]
  },
  "message": "Fix generated successfully"
}
```

#### POST /api/ai/analyze-error
**Purpose**: Analyze monitor error and provide insights
**Request Body**:
```json
{
  "monitorId": "string",
  "errorLogs": "string",
  "lastWorkingVersion": "string", // optional
  "targetUrl": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "analysis": "string",
    "rootCause": "string",
    "errorType": "selector_change|rate_limit|authentication|timeout|structure_change",
    "recommendations": ["string"],
    "severity": "low|medium|high"
  }
}
```

#### POST /api/ai/validate-fix
**Purpose**: Validate generated fix before deployment
**Request Body**:
```json
{
  "monitorId": "string",
  "fixCode": "string",
  "originalCode": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "validation": {
      "safetyCheck": true,
      "compatibility": true,
      "impactLevel": "low|medium|high",
      "warnings": ["string"]
    }
  }
}
```

### 5.2 Required AI Model Capabilities

#### Code Analysis
- Parse Python/JavaScript scraping code
- Identify selectors, API endpoints, authentication
- Detect common scraping patterns

#### Error Classification
- Classify error types (selector changes, rate limits, auth issues)
- Determine root causes from error messages
- Assess impact severity

#### Code Generation
- Generate updated selectors and logic
- Add error handling and retry mechanisms
- Maintain code style and structure consistency

#### Validation
- Validate generated code syntax
- Check for security vulnerabilities
- Assess compatibility with existing systems

## 6. Implementation Guidelines

### 6.1 AI Service Integration

#### Recommended Architecture
```
Frontend → Backend API → AI Service → External AI Provider (OpenAI, Claude, etc.)
```

#### Error Handling Strategy
- Graceful degradation when AI service is unavailable
- Retry logic with exponential backoff
- Fallback to manual fix workflows
- Clear error messages for users

#### Response Time Expectations
- AI fix generation: 2-10 seconds
- Error analysis: 1-5 seconds
- Code validation: 1-3 seconds

### 6.2 Data Requirements

#### For Effective AI Processing
1. **Monitor Configuration**: URL, selectors, expected data structure
2. **Error Context**: Full error logs, stack traces, timestamps
3. **Historical Data**: Previous successful runs, change history
4. **Screenshots**: Visual context when available
5. **HTML Source**: Page structure for analysis

#### Data Privacy Considerations
- Sanitize sensitive data before sending to AI
- Implement data retention policies
- Ensure compliance with privacy regulations

### 6.3 Security Considerations

#### AI Input Validation
- Sanitize all inputs before processing
- Validate generated code for security issues
- Implement rate limiting for AI endpoints

#### Code Execution Safety
- Sandbox generated code execution
- Validate against known safe patterns
- Implement approval workflows for high-risk changes

## 7. Technical Specifications

### 7.1 Database Schema Extensions

#### AI Fix History Table
```sql
CREATE TABLE ai_fixes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monitor_id TEXT NOT NULL,
  original_code TEXT NOT NULL,
  generated_code TEXT NOT NULL,
  explanation TEXT,
  confidence REAL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  applied_at DATETIME,
  pr_url TEXT,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);
```

#### Error Analysis Table
```sql
CREATE TABLE error_analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monitor_id TEXT NOT NULL,
  error_type TEXT,
  root_cause TEXT,
  severity TEXT,
  recommendations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);
```

### 7.2 Environment Variables

#### Required Configuration
```bash
# AI Service Configuration
AI_SERVICE_URL=https://your-ai-service.com/api
AI_SERVICE_API_KEY=your-api-key
AI_SERVICE_TIMEOUT=30000
AI_SERVICE_MAX_RETRIES=3

# Feature Flags
ENABLE_AI_FIXES=true
ENABLE_AUTO_DEPLOYMENT=false
AI_CONFIDENCE_THRESHOLD=0.8

# Rate Limiting
AI_REQUESTS_PER_MINUTE=10
AI_DAILY_QUOTA=100
```

### 7.3 Monitoring and Logging

#### AI Service Metrics
- Response times for each AI endpoint
- Success/failure rates
- Confidence score distributions
- User acceptance rates for generated fixes

#### Logging Requirements
- All AI requests and responses
- Error classifications and analyses
- Fix generation results
- Deployment outcomes

## 8. Testing Strategy

### 8.1 Unit Tests
- AI service integration tests
- Error handling scenarios
- Code generation validation
- Response parsing and formatting

### 8.2 Integration Tests
- End-to-end fix generation workflow
- API endpoint functionality
- Database operations
- External service communication

### 8.3 User Acceptance Tests
- Magic button functionality
- Code comparison display
- Deployment approval workflow
- Error message clarity

## 9. Deployment and Scaling

### 9.1 Development Environment Setup

#### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure AI service settings
npm start
```

#### Frontend Setup
```bash
npm install
npm start
```

### 9.2 Production Considerations

#### Performance Optimization
- Implement caching for AI responses
- Use connection pooling for database
- Optimize frontend bundle size
- Implement CDN for static assets

#### Scalability
- Horizontal scaling for AI service
- Database sharding for large datasets
- Load balancing for high availability
- Monitoring and alerting systems

## 10. Next Steps for Implementation

### Phase 1: Core AI Integration
1. Implement AI service endpoints
2. Integrate with external AI provider
3. Add error handling and validation
4. Update frontend service calls

### Phase 2: Enhanced Features
1. Add screenshot analysis
2. Implement learning from user feedback
3. Add batch processing capabilities
4. Enhance code generation models

### Phase 3: Advanced Analytics
1. Implement fix success tracking
2. Add performance monitoring
3. Create usage analytics dashboard
4. Implement A/B testing for AI models

## 11. Support and Maintenance

### 11.1 Documentation
- API documentation with examples
- User guides for new features
- Troubleshooting guides
- Performance optimization tips

### 11.2 Monitoring
- Real-time system health monitoring
- AI service performance tracking
- User activity analytics
- Error rate monitoring

### 11.3 Updates and Maintenance
- Regular AI model updates
- Security patch management
- Performance optimization
- Feature enhancements based on user feedback

## 12. Contact Information

For questions regarding this implementation:
- Frontend Issues: Contact frontend team
- Backend API: Contact backend team
- AI Integration: Contact AI/ML team
- DevOps/Deployment: Contact infrastructure team

---

*This document serves as a comprehensive guide for implementing the GenAI solution into the Monitor Dashboard application. Regular updates will be made as the implementation progresses.*