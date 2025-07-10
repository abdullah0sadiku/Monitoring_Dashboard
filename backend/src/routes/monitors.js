const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const { validateMonitor } = require('../middleware/validation');

// Get all monitors
router.get('/', monitorController.getAllMonitors);

// Get a specific monitor
router.get('/:id', monitorController.getMonitorById);

// Create a new monitor
router.post('/', validateMonitor, monitorController.createMonitor);

// Update a monitor
router.put('/:id', validateMonitor, monitorController.updateMonitor);

// Delete a monitor
router.delete('/:id', monitorController.deleteMonitor);

// Test monitor configuration
router.post('/test', monitorController.testMonitor);

// Get broken monitors
router.get('/status/broken', monitorController.getBrokenMonitors);

// Get monitor statistics
router.get('/stats/overview', monitorController.getMonitorStats);

module.exports = router; 