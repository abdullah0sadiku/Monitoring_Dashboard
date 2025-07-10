// Application constants
export const APP_CONFIG = {
  name: 'Monitor Dashboard',
  version: '1.0.0',
  description: 'AI-powered website monitoring and automated fix deployment system'
};

// Monitor statuses
export const MONITOR_STATUS = {
  WORKING: 'Working',
  BROKEN: 'Broken',
  PENDING: 'Pending',
  MAINTENANCE: 'Maintenance'
};

// API endpoints (for future integration)
export const API_ENDPOINTS = {
  monitors: '/api/monitors',
  generateFix: '/api/ai/generate-fix',
  deployFix: '/api/deploy-fix',
  createPR: '/api/github/create-pr'
};

// UI constants
export const UI_CONSTANTS = {
  maxRetries: 3,
  defaultTimeout: 30000,
  refreshInterval: 60000, // 1 minute
  aiFixTimeout: 3000, // 3 seconds for demo
  deployTimeout: 2500 // 2.5 seconds for demo
};

// Error messages
export const ERROR_MESSAGES = {
  monitorNotFound: 'Monitor not found',
  networkError: 'Network error occurred',
  aiServiceUnavailable: 'AI service is currently unavailable',
  deploymentFailed: 'Deployment failed',
  unauthorized: 'Unauthorized access'
};

// Success messages
export const SUCCESS_MESSAGES = {
  fixGenerated: 'AI fix generated successfully',
  deploymentComplete: 'Solution deployed successfully',
  monitorRestored: 'Monitor restored to operational status'
}; 