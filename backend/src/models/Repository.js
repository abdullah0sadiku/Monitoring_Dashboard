const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Repository = sequelize.define('Repository', {
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
  type: {
    type: DataTypes.ENUM('github', 'gitlab'),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isUrl: true
    }
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  repo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  branch: {
    type: DataTypes.STRING,
    defaultValue: 'main'
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  webhookSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
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
      fields: ['type', 'owner', 'repo'],
      unique: true
    },
    {
      fields: ['isActive']
    }
  ]
});

// Static method to get active repositories
Repository.getActiveRepositories = function() {
  return this.findAll({
    where: {
      isActive: true
    }
  });
};

// Static method to get repositories by type
Repository.getByType = function(type) {
  return this.findAll({
    where: {
      type,
      isActive: true
    }
  });
};

module.exports = Repository; 