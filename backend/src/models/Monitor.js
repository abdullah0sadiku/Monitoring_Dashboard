const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Monitor = sequelize.define('Monitor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isUrl: true
    }
  },
  monitorType: {
    type: DataTypes.ENUM('web_scraping', 'api_monitoring', 'price_tracking', 'content_monitoring', 'data_extraction'),
    defaultValue: 'web_scraping'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'broken', 'maintenance'),
    defaultValue: 'active'
  },
  frequency: {
    type: DataTypes.INTEGER, // minutes
    defaultValue: 30
  },
  selectors: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('selectors');
      return value ? JSON.parse(value) : { css: [], xpath: [] };
    },
    set(value) {
      this.setDataValue('selectors', JSON.stringify(value));
    }
  },
  dataMapping: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('dataMapping');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('dataMapping', JSON.stringify(value));
    }
  },
  // Enhanced GitHub Repository Configuration
  scraperRepository: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('scraperRepository');
      return value ? JSON.parse(value) : {
        url: '',
        branch: 'main',
        scriptPath: '',
        deploymentPath: '',
        accessToken: ''
      };
    },
    set(value) {
      this.setDataValue('scraperRepository', JSON.stringify(value));
    }
  },
  // Scraper Performance Monitoring
  performanceMetrics: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('performanceMetrics');
      return value ? JSON.parse(value) : {
        maxResponseTime: 30000,
        minSuccessRate: 95,
        alertThreshold: 5,
        enablePerformanceAlerts: true,
        trackMemoryUsage: true,
        trackCpuUsage: true
      };
    },
    set(value) {
      this.setDataValue('performanceMetrics', JSON.stringify(value));
    }
  },
  // Scraper Quality Monitoring
  qualityChecks: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('qualityChecks');
      return value ? JSON.parse(value) : {
        dataValidation: true,
        schemaValidation: true,
        duplicateDetection: true,
        missingDataAlerts: true,
        qualityThreshold: 90,
        expectedDataPoints: 0,
        enableQualityAlerts: true
      };
    },
    set(value) {
      this.setDataValue('qualityChecks', JSON.stringify(value));
    }
  },
  // Deployment Configuration
  deploymentConfig: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('deploymentConfig');
      return value ? JSON.parse(value) : {
        environment: 'production',
        autoDeployOnChange: false,
        deploymentPlatform: 'github_actions',
        dockerImage: '',
        environmentVariables: {}
      };
    },
    set(value) {
      this.setDataValue('deploymentConfig', JSON.stringify(value));
    }
  },
  validationRules: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('validationRules');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('validationRules', JSON.stringify(value));
    }
  },
  repositoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Repositories',
      key: 'id'
    }
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  branch: {
    type: DataTypes.STRING,
    defaultValue: 'main'
  },
  timeout: {
    type: DataTypes.INTEGER,
    defaultValue: 30000 // 30 seconds
  },
  retryAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  lastCheck: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastAction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  errorSummary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['status', 'lastCheck']
    },
    {
      fields: ['targetUrl']
    },
    {
      fields: ['repositoryId']
    }
  ]
});

// Instance method to update monitor status
Monitor.prototype.updateStatus = async function(status, action, errorSummary = null) {
  this.status = status;
  this.lastAction = action;
  this.lastCheck = new Date();
  if (errorSummary) {
    this.errorSummary = errorSummary;
  }
  return await this.save();
};

// Static method to get broken monitors
Monitor.getBrokenMonitors = function() {
  return this.findAll({
    where: {
      status: 'broken',
      isActive: true
    }
  });
};

// Static method to get active monitors
Monitor.getActiveMonitors = function() {
  return this.findAll({
    where: {
      isActive: true
    }
  });
};

module.exports = Monitor; 