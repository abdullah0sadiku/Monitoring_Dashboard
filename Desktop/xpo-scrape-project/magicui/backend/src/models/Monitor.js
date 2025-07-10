const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  targetUrl: {
    type: String,
    required: true,
    trim: true
  },
  monitorType: {
    type: String,
    enum: ['web_scraping', 'api_monitoring', 'price_tracking', 'content_monitoring'],
    default: 'web_scraping'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'broken', 'maintenance'],
    default: 'active'
  },
  frequency: {
    type: Number, // minutes
    default: 30
  },
  selectors: {
    css: [String],
    xpath: [String]
  },
  dataMapping: {
    type: Map,
    of: String
  },
  validationRules: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository'
  },
  filePath: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    default: 'main'
  },
  timeout: {
    type: Number,
    default: 30000 // 30 seconds
  },
  retryAttempts: {
    type: Number,
    default: 3
  },
  lastCheck: {
    type: Date,
    default: Date.now
  },
  lastAction: {
    type: String,
    trim: true
  },
  errorSummary: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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
monitorSchema.index({ status: 1, lastCheck: -1 });
monitorSchema.index({ targetUrl: 1 });
monitorSchema.index({ repository: 1 });

// Virtual for checking if monitor is broken
monitorSchema.virtual('isBroken').get(function() {
  return this.status === 'broken';
});

// Method to update monitor status
monitorSchema.methods.updateStatus = function(status, action, errorSummary = null) {
  this.status = status;
  this.lastAction = action;
  this.lastCheck = new Date();
  if (errorSummary) {
    this.errorSummary = errorSummary;
  }
  return this.save();
};

// Static method to get broken monitors
monitorSchema.statics.getBrokenMonitors = function() {
  return this.find({ status: 'broken', isActive: true });
};

// Static method to get active monitors
monitorSchema.statics.getActiveMonitors = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('Monitor', monitorSchema); 