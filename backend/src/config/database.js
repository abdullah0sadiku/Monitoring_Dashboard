const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false, // Set to console.log to see SQL queries
});

const connectDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ SQLite database connected successfully');
    
    // Import models to set up associations
    require('../models');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase, sequelize }; 