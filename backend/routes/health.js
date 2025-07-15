const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  const db = getDatabase();
  
  // Test database connection
  db.get('SELECT 1 as test', (err, row) => {
    if (err) {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'down',
          api: 'up'
        },
        error: 'Database connection failed'
      });
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up'
      },
      version: '1.0.0'
    });
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  const db = getDatabase();
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };

  // Test database
  db.get('SELECT COUNT(*) as userCount FROM users', (err, row) => {
    if (err) {
      healthInfo.services.database = {
        status: 'down',
        error: err.message
      };
    } else {
      healthInfo.services.database = {
        status: 'up',
        userCount: row.userCount
      };
    }

    // Test monitors table
    db.get('SELECT COUNT(*) as monitorCount FROM monitors', (err, row) => {
      if (err) {
        healthInfo.services.monitors = {
          status: 'down',
          error: err.message
        };
      } else {
        healthInfo.services.monitors = {
          status: 'up',
          monitorCount: row.monitorCount
        };
      }

      // Check if any service is down
      const hasDownService = Object.values(healthInfo.services).some(
        service => service.status === 'down'
      );

      if (hasDownService) {
        healthInfo.status = 'unhealthy';
        res.status(503).json(healthInfo);
      } else {
        res.json(healthInfo);
      }
    });
  });
});

module.exports = router; 