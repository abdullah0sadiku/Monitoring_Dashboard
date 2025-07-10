# Monitor Dashboard - AI-Powered Scraper Management System

## Project Overview

The Monitor Dashboard is a React-based web application designed to manage and automatically fix broken web scraping monitors. The system provides a user-friendly interface for monitoring scraper health, generating AI-powered fixes, and deploying solutions to restore functionality. The application includes role-based authentication, manual monitor management, repository configuration, and advanced code comparison features.

## System Architecture

### Core Components

- **Frontend Dashboard**: React application with Tailwind CSS styling
- **Backend API**: Node.js/Express server with MongoDB database
- **AI Service Integration**: Automated fix generation for broken scrapers
- **Deployment Service**: Automated deployment and GitHub/GitLab integration
- **Monitor Management**: Real-time status tracking and manual monitor configuration
- **Repository Management**: GitHub/GitLab repository configuration and deployment
- **Authentication System**: Role-based access control (Admin/Operator)
- **Code Comparison**: Side-by-side old vs new code review interface

### Technology Stack

- **Frontend**: React 19.1.0, React Router DOM 7.6.3
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Styling**: Tailwind CSS
- **Testing**: React Testing Library
- **Build Tool**: React Scripts 5.0.1
- **Version Control**: GitHub API, GitLab API
- **Database**: MongoDB with Mongoose ODM

## Project Structure

```
magicui/
├── src/                     # React frontend application
│   ├── components/          # React components
│   │   ├── Dashboard.js           # Main dashboard view with authentication
│   │   ├── Login.js               # Authentication component with role selection
│   │   ├── BrokenScrapersList.js  # List of broken monitors
│   │   ├── ScraperFixDetail.js    # Detailed fix interface
│   │   ├── AiFixReview.js         # AI fix review with code comparison
│   │   ├── Confirmation.js        # Confirmation dialogs
│   │   ├── MonitorDetail.js       # Individual monitor details
│   │   ├── DeploymentReview.js    # Deployment status review
│   │   ├── MonitorForm.js         # Add/Edit monitor form
│   │   └── RepositoryConfig.js    # Repository configuration
│   ├── services/            # API services
│   │   ├── aiService.js           # AI fix generation service
│   │   ├── deploymentService.js   # Deployment and GitHub integration
│   │   ├── monitorService.js      # Monitor management API
│   │   └── repositoryService.js   # Repository configuration API
│   ├── utils/               # Utility functions
│   │   └── constants.js           # Application constants
│   ├── App.js               # Main application component with routing
│   └── index.js             # Application entry point
├── backend/                  # Node.js backend server
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   │   ├── monitorController.js   # Monitor CRUD operations
│   │   │   ├── deploymentController.js # Deployment operations
│   │   │   ├── repositoryController.js # Repository management
│   │   │   └── aiController.js        # AI service integration
│   │   ├── services/        # Business logic services
│   │   │   ├── gitService.js          # Git operations
│   │   │   ├── githubService.js       # GitHub API integration
│   │   │   ├── gitlabService.js       # GitLab API integration
│   │   │   └── deploymentService.js   # Deployment orchestration
│   │   ├── models/          # Data models
│   │   │   ├── Monitor.js             # Monitor data model
│   │   │   ├── Repository.js          # Repository configuration model
│   │   │   └── Deployment.js          # Deployment history model
│   │   ├── routes/          # API routes
│   │   │   ├── monitors.js            # Monitor endpoints
│   │   │   ├── deployments.js         # Deployment endpoints
│   │   │   ├── repositories.js        # Repository endpoints
│   │   │   └── ai.js                  # AI service endpoints
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js                # Authentication middleware
│   │   │   ├── validation.js          # Request validation
│   │   │   └── errorHandler.js        # Error handling
│   │   ├── config/          # Configuration files
│   │   │   ├── database.js            # Database configuration
│   │   │   └── git.js                 # Git configuration
│   │   └── app.js           # Express application setup
│   ├── package.json         # Backend dependencies
│   └── .env.example         # Environment variables template
├── package.json             # Root package.json for scripts
└── README.md               # Project documentation
```

## Authentication System

### User Roles

#### Admin User
- **Full System Access**: All dashboard features and configurations
- **Monitor Management**: Add, edit, delete, and configure monitors
- **Repository Management**: Configure GitHub/GitLab repositories
- **Deployment Control**: Approve and manage deployments
- **AI Fix Review**: Review and approve AI-generated solutions
- **System Configuration**: Access to advanced settings and configurations

#### Operator User
- **Limited Access**: Basic dashboard monitoring and fix approval
- **Monitor Viewing**: View monitor status and details
- **Fix Review**: Review AI-generated fixes with code comparison
- **Deployment Approval**: Approve deployments for broken monitors
- **Basic Operations**: Add simple monitors and basic configurations

### Authentication Features
- **Role-based Login**: Separate login flows for different user types
- **Auto-filled Credentials**: Demo credentials for easy testing
- **Session Management**: Persistent login state with logout functionality
- **Protected Routes**: Route protection based on authentication status
- **User Information Display**: Show user name and role in header

## Application Features

### Dashboard Overview
- **Real-time Monitor Status**: Live display of all monitor states
- **Statistics Dashboard**: Total, Working, and Broken monitor counts
- **Quick Actions**: Add new monitor, configure repositories, view broken monitors
- **User Information**: Display current user and role
- **Authentication Status**: Login/logout functionality
- **Last Update Timestamps**: Real-time status updates

### Monitor Management
- **Manual Monitor Addition**: Web-based form to add new monitors
- **Monitor Configuration**: Set URL, selectors, frequency, and settings
- **Repository Integration**: Connect monitors to GitHub/GitLab repositories
- **Individual Monitor Detail Views**: Comprehensive monitor information
- **Status Tracking and History**: Monitor performance over time
- **Error Summary and Diagnostics**: Detailed error information
- **Action Buttons**: Generate AI fix, test monitor, edit configuration

### Repository Management
- **GitHub Integration**: Connect GitHub repositories for deployment
- **GitLab Integration**: Connect GitLab repositories for deployment
- **Repository Configuration**: Set branches, paths, and authentication
- **Deployment Settings**: Configure deployment strategies and rollback options
- **Repository Testing**: Test connectivity and permissions
- **Authentication Management**: Secure token and credential storage

### AI-Powered Fix Generation
- **Automated Problem Analysis**: AI analysis of monitor failures
- **Code Generation with Explanations**: Detailed fix explanations
- **Confidence Scoring**: AI confidence in generated solutions
- **Estimated Resolution Time**: Time estimates for fix deployment
- **Multiple Fix Options**: Alternative solutions when available

### Advanced Code Comparison Feature
- **Side-by-Side Code Review**: Old broken code vs new fixed code
- **Visual Code Comparison**: Syntax-highlighted code blocks
- **Issue Identification**: Clear marking of problems in old code
- **Improvement Documentation**: Detailed list of fixes applied
- **Dynamic Code Examples**: Different examples based on scraper type
- **Color-coded Indicators**: Red for issues, green for improvements
- **Responsive Layout**: Works on desktop and mobile devices

#### Code Comparison Features:
- **Old Code Container**: Shows broken code with red warning indicators
- **New Code Container**: Shows AI-generated fixed code with green success indicators
- **Issue Analysis**: Lists specific problems found in old code
- **Improvement Summary**: Shows what the AI fixed in new code
- **Multiple Scraper Types**: Examples for Selenium, BeautifulSoup, Tweepy, etc.
- **Realistic Examples**: Common issues like outdated selectors, missing error handling

### Deployment System
- **Automated GitHub/GitLab Integration**: Pull request creation
- **Deployment Status Tracking**: Real-time deployment monitoring
- **Rollback Capabilities**: Quick rollback to previous versions
- **Multi-repository Support**: Manage multiple repositories
- **Deployment History**: Track all deployment activities
- **Error Handling**: Comprehensive deployment error management

## User Roles and Workflows

### For Scripting Developers

#### Responsibilities
- Develop and maintain web scraping scripts
- Monitor script performance and reliability
- Debug and fix script issues when automated solutions fail
- Update script configurations and dependencies
- Configure repository settings for deployment
- Review AI-generated fixes for technical accuracy

#### Integration Points
1. **Monitor Configuration**: Scripts should report their status to the dashboard
2. **Error Reporting**: Implement standardized error reporting format
3. **Fix Validation**: Test AI-generated fixes before deployment
4. **Version Control**: Maintain script versions in the repository
5. **Repository Setup**: Configure GitHub/GitLab repositories for deployment
6. **Code Review**: Review side-by-side code comparisons for accuracy

#### Development Guidelines
- Use consistent error handling patterns
- Implement proper logging for debugging
- Follow naming conventions for monitors
- Document script dependencies and requirements
- Set up proper repository structure for deployment
- Review AI-generated fixes for technical correctness

### For GenAI Operators (Non-Technical Users)

#### Responsibilities
- Monitor dashboard for broken scrapers
- Review AI-generated fixes with code comparison
- Approve or reject automated solutions
- Deploy fixes to production
- Add new monitors manually
- Configure repository settings
- Communicate with technical team when needed

#### Workflow Process

1. **Dashboard Monitoring**
   - Check dashboard for monitors marked as "Needs Attention"
   - Review error summaries and last action details
   - Prioritize issues based on business impact

2. **Manual Monitor Management**
   - Add new monitors through the web interface
   - Configure monitor settings (URL, selectors, frequency)
   - Set up repository connections for deployment
   - Test monitor configuration before activation

3. **Repository Configuration**
   - Connect GitHub/GitLab repositories
   - Configure deployment branches and paths
   - Set up authentication tokens
   - Test repository connectivity

4. **AI Fix Generation**
   - Navigate to broken monitor details
   - Click "Generate AI Fix" button
   - Wait for AI analysis (typically 2-3 minutes)
   - Review generated code and explanation

5. **Fix Review and Approval with Code Comparison**
   - Examine AI-generated solution in side-by-side view
   - Compare old broken code with new fixed code
   - Review issue identification and improvement summary
   - Check confidence level and estimated fix time
   - Approve or request manual intervention

6. **Deployment Process**
   - Confirm deployment after approval
   - Monitor deployment progress
   - Verify monitor restoration
   - Document any issues or concerns

## Backend API Endpoints

### Monitor Management
- `GET /api/monitors` - Get all monitors
- `POST /api/monitors` - Create new monitor
- `GET /api/monitors/:id` - Get specific monitor
- `PUT /api/monitors/:id` - Update monitor
- `DELETE /api/monitors/:id` - Delete monitor
- `POST /api/monitors/:id/test` - Test monitor configuration

### Repository Management
- `GET /api/repositories` - Get all repositories
- `POST /api/repositories` - Add new repository
- `GET /api/repositories/:id` - Get specific repository
- `PUT /api/repositories/:id` - Update repository
- `DELETE /api/repositories/:id` - Remove repository
- `POST /api/repositories/:id/test` - Test repository connection

### Deployment Operations
- `POST /api/deployments` - Create new deployment
- `GET /api/deployments` - Get deployment history
- `GET /api/deployments/:id` - Get deployment status
- `POST /api/deployments/:id/rollback` - Rollback deployment
- `POST /api/github/create-pr` - Create GitHub pull request
- `POST /api/gitlab/create-mr` - Create GitLab merge request

### AI Service Integration
- `POST /api/ai/generate-fix` - Generate AI fix for broken monitor
- `POST /api/ai/validate-fix` - Validate generated fix
- `POST /api/ai/analyze-error` - Analyze monitor error patterns

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/refresh` - Refresh authentication token

## Configuration and Setup

### Environment Variables

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AI_API_URL=http://localhost:3001/api/ai
REACT_APP_DEPLOYMENT_API_URL=http://localhost:3001/api/deployments
```

#### Backend (.env)
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/monitor-dashboard

# GitHub Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

# GitLab Configuration
GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret
GITLAB_WEBHOOK_SECRET=your_gitlab_webhook_secret

# AI Service Configuration
AI_SERVICE_API_KEY=your_ai_service_key
AI_SERVICE_URL=https://api.openai.com/v1

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### Installation

#### Prerequisites
- Node.js (v18 or higher)
- MongoDB (for backend data storage)
- Git (for deployment operations)
- GitHub/GitLab account with API access

#### Frontend Setup
```bash
npm install
npm start
```

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Database Setup
```bash
# Start MongoDB (if using local installation)
mongod

# Or use MongoDB Atlas (cloud service)
# Update DATABASE_URL in .env file
```

### Build for Production
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## Manual Monitor Configuration

### Adding a New Monitor

1. **Basic Information**
   - Monitor Name: Descriptive name for the scraper
   - Target URL: The website URL to monitor
   - Monitor Type: Web scraping, API monitoring, etc.
   - Frequency: How often to check (every 5 minutes, hourly, daily)

2. **Scraping Configuration**
   - CSS Selectors: Elements to extract data from
   - XPath Selectors: Alternative element selection method
   - Data Mapping: Define what data to extract and how to store it
   - Validation Rules: Ensure data quality and completeness

3. **Repository Settings**
   - Repository URL: GitHub/GitLab repository for deployment
   - Branch: Target branch for deployments (main, develop, etc.)
   - File Path: Where to store the monitor script
   - Authentication: API tokens or SSH keys

4. **Advanced Settings**
   - Timeout Configuration: Request timeout settings
   - Retry Logic: Number of retry attempts on failure
   - Error Handling: Custom error handling rules
   - Notifications: Alert settings for failures

### Repository Configuration

#### GitHub Setup
1. Create GitHub OAuth App
2. Generate Personal Access Token
3. Configure webhook for deployment notifications
4. Set repository permissions for deployment

#### GitLab Setup
1. Create GitLab OAuth App
2. Generate Personal Access Token
3. Configure webhook for deployment notifications
4. Set repository permissions for deployment

## Code Comparison Feature

### Overview
The AI Fix Review component includes an advanced side-by-side code comparison feature that allows users to:

- **Compare Old vs New Code**: View broken code alongside AI-generated fixes
- **Identify Issues**: Clearly marked problems in the original code
- **Review Improvements**: Detailed list of fixes applied by AI
- **Understand Changes**: Visual indicators of what was changed and why

### Features
- **Dynamic Code Examples**: Different examples based on scraper type
- **Syntax Highlighting**: Proper code formatting and colors
- **Issue Analysis**: Lists specific problems found in old code
- **Improvement Summary**: Shows what the AI fixed in new code
- **Responsive Design**: Works on desktop and mobile devices
- **Color-coded Indicators**: Red for issues, green for improvements

### Code Examples Included
- **Selenium Scrapers**: Outdated element selectors and column mapping
- **BeautifulSoup Scrapers**: Missing timeout handling and wrong CSS selectors
- **Twitter API Scrapers**: Lack of rate limiting and error handling
- **Generic Scrapers**: Basic extraction without proper error handling

## Error Handling

### Common Error Types
- **Network Errors**: Connection issues with external services
- **AI Service Unavailable**: AI fix generation service down
- **Deployment Failures**: Issues with code deployment
- **Authentication Errors**: GitHub/GitLab API access problems
- **Repository Errors**: Repository configuration issues
- **Monitor Configuration Errors**: Invalid monitor settings
- **Authentication Failures**: Login and session management issues

### Error Resolution
1. Check service status and connectivity
2. Verify API credentials and permissions
3. Review error logs for specific details
4. Test repository connections
5. Validate monitor configurations
6. Check authentication status and permissions
7. Contact technical team for complex issues

## Security Considerations

### Access Control
- **Role-based Authentication**: Admin and Operator user roles
- **Protected Routes**: Route protection based on authentication status
- **Session Management**: Secure session handling with logout functionality
- **API Security**: Secure API endpoints with proper authentication
- **Deployment Permissions**: Restrict deployment to authorized users

### Data Protection
- **Encrypted Storage**: Encrypt sensitive configuration data
- **Secure Credentials**: Secure API keys and repository tokens
- **Audit Logging**: Implement audit logging for all actions
- **Token Management**: Secure repository access token storage
- **Session Security**: Secure session management and timeout

### Repository Security
- **Environment Variables**: Use environment variables for sensitive data
- **Token Rotation**: Implement proper token rotation
- **Webhook Security**: Secure webhook endpoints
- **Permission Validation**: Validate deployment permissions
- **Access Control**: Restrict repository access to authorized users

## Monitoring and Maintenance

### System Health Checks
- **AI Service Monitoring**: Regular monitoring of AI service availability
- **API Rate Limiting**: GitHub/GitLab API rate limit monitoring
- **Dashboard Performance**: Dashboard performance optimization
- **Error Tracking**: Error rate tracking and alerting
- **Repository Connectivity**: Repository connectivity monitoring
- **Authentication Status**: Monitor authentication system health

### Backup and Recovery
- **Configuration Backup**: Regular backup of monitor configurations
- **Version Control**: Version control for all script changes
- **Deployment Rollback**: Rollback procedures for failed deployments
- **Disaster Recovery**: Disaster recovery documentation
- **Repository Backup**: Repository backup strategies
- **User Data Backup**: Backup user authentication and configuration data

## Troubleshooting Guide

### Common Issues

1. **Authentication Problems**
   - Check login credentials and role permissions
   - Verify session status and timeout settings
   - Review authentication middleware configuration

2. **AI Fix Generation Fails**
   - Check AI service connectivity
   - Verify error data format
   - Review service logs

3. **Code Comparison Not Displaying**
   - Check component rendering and data loading
   - Verify code example generation
   - Review browser console for errors

4. **Deployment Timeout**
   - Check GitHub/GitLab API status
   - Verify repository permissions
   - Review network connectivity

5. **Monitor Status Not Updating**
   - Check monitor reporting endpoint
   - Verify data format consistency
   - Review dashboard refresh settings

6. **Repository Connection Fails**
   - Verify API tokens and permissions
   - Check repository URL and branch
   - Test authentication manually

7. **Manual Monitor Addition Fails**
   - Validate URL format and accessibility
   - Check CSS/XPath selectors
   - Verify repository configuration

### Support Contacts
- **Technical Issues**: Development Team
- **AI Service Issues**: AI Operations Team
- **Deployment Issues**: DevOps Team
- **Repository Issues**: Git Operations Team
- **Authentication Issues**: Security Team

## Future Enhancements

### Planned Features
- **Advanced Monitoring Analytics**: Enhanced monitoring and reporting
- **Machine Learning Improvements**: Better AI model performance
- **Enhanced Deployment Automation**: More sophisticated deployment strategies
- **Additional Platform Integration**: Support for more platforms
- **Multi-tenant Support**: Multi-tenant architecture
- **Advanced Repository Management**: Enhanced repository features
- **Real-time Collaboration**: Team collaboration features
- **Advanced Code Analysis**: More sophisticated code comparison tools

### Roadmap
- **Q1 2024**: Enhanced error categorization and code comparison
- **Q2 2024**: Predictive failure detection
- **Q3 2024**: Advanced deployment strategies
- **Q4 2024**: Performance optimization and mobile improvements
- **Q1 2025**: Multi-cloud deployment support
- **Q2 2025**: Advanced AI capabilities and machine learning

## Contributing

### Development Guidelines
- Follow React best practices and hooks
- Use TypeScript for new components
- Implement comprehensive testing
- Document all API changes
- Follow Git workflow standards
- Maintain code comparison feature quality

### Code Review Process
- All changes require pull request review
- Automated testing must pass
- Documentation updates required
- Security review for deployment changes
- Repository configuration validation
- Code comparison feature testing

---
 
**Maintainer**: Dulla XPO
**Features**: Authentication, Code Comparison, Manual Monitor Management, Repository Integration
