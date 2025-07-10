const { sequelize } = require('../config/database');
const Monitor = require('./Monitor');
const Repository = require('./Repository');

// Define associations
Monitor.belongsTo(Repository, {
  foreignKey: 'repositoryId',
  as: 'repository'
});

Repository.hasMany(Monitor, {
  foreignKey: 'repositoryId',
  as: 'monitors'
});

module.exports = {
  sequelize,
  Monitor,
  Repository
}; 