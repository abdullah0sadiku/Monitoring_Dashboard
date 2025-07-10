const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  provider: {
    type: String,
    enum: ['github', 'gitlab'],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  repo: {
    type: String,
    required: true,
    trim: true
  },
  defaultBranch: {
    type: String,
    default: 'main'
  },
  accessToken: {
    type: String,
    required: true
  },
  webhookSecret: {
    type: String
  },
  webhookUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deploymentSettings: {
    autoDeploy: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: true
    },
    deploymentBranch: {
      type: String,
      default: 'main'
    },
    deploymentPath: {
      type: String,
      default: '/monitors'
    },
    rollbackEnabled: {
      type: Boolean,
      default: true
    }
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  syncStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
repositorySchema.index({ provider: 1, owner: 1, repo: 1 });
repositorySchema.index({ isActive: 1 });

// Virtual for full repository name
repositorySchema.virtual('fullName').get(function() {
  return `${this.owner}/${this.repo}`;
});

// Virtual for API URL
repositorySchema.virtual('apiUrl').get(function() {
  if (this.provider === 'github') {
    return `https://api.github.com/repos/${this.owner}/${this.repo}`;
  } else if (this.provider === 'gitlab') {
    return `https://gitlab.com/api/v4/projects/${this.owner}%2F${this.repo}`;
  }
  return null;
});

// Method to test repository connection
repositorySchema.methods.testConnection = async function() {
  try {
    const axios = require('axios');
    
    if (this.provider === 'github') {
      const response = await axios.get(this.apiUrl, {
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return { success: true, data: response.data };
    } else if (this.provider === 'gitlab') {
      const response = await axios.get(this.apiUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status
    };
  }
};

// Method to update sync status
repositorySchema.methods.updateSyncStatus = function(status, errorMessage = null) {
  this.syncStatus = status;
  this.lastSync = new Date();
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
  return this.save();
};

// Static method to get active repositories
repositorySchema.statics.getActiveRepositories = function() {
  return this.find({ isActive: true });
};

// Static method to get repositories by provider
repositorySchema.statics.getByProvider = function(provider) {
  return this.find({ provider, isActive: true });
};

module.exports = mongoose.model('Repository', repositorySchema); 