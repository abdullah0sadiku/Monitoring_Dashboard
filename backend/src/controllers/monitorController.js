const Monitor = require('../models/Monitor');
const Repository = require('../models/Repository');
const axios = require('axios');

// Get all monitors
const getAllMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.findAll({
      where: { isActive: true },
      include: [{
        model: Repository,
        as: 'repository'
      }]
    });
    
    res.json({
      success: true,
      data: monitors,
      message: 'Monitors retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting monitors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitors',
      message: error.message
    });
  }
};

// Get monitor by ID
const getMonitorById = async (req, res) => {
  try {
    const monitor = await Monitor.findByPk(req.params.id, {
      include: [{
        model: Repository,
        as: 'repository'
      }]
    });
    
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: 'Monitor not found'
      });
    }
    
    res.json({
      success: true,
      data: monitor,
      message: 'Monitor retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitor',
      message: error.message
    });
  }
};

// Create new monitor
const createMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.create(req.body);
    
    res.status(201).json({
      success: true,
      data: monitor,
      message: 'Monitor created successfully'
    });
  } catch (error) {
    console.error('Error creating monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create monitor',
      message: error.message
    });
  }
};

// Update monitor
const updateMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findByPk(req.params.id);
    
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: 'Monitor not found'
      });
    }
    
    await monitor.update(req.body);
    
    res.json({
      success: true,
      data: monitor,
      message: 'Monitor updated successfully'
    });
  } catch (error) {
    console.error('Error updating monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update monitor',
      message: error.message
    });
  }
};

// Delete monitor
const deleteMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findByPk(req.params.id);
    
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: 'Monitor not found'
      });
    }
    
    await monitor.update({ isActive: false });
    
    res.json({
      success: true,
      message: 'Monitor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete monitor',
      message: error.message
    });
  }
};

// Test monitor configuration
const testMonitor = async (req, res) => {
  try {
    const { targetUrl, selectors, timeout } = req.body;
    
    // Test URL accessibility
    const response = await axios.get(targetUrl, {
      timeout: timeout || 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status !== 200) {
      return res.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      });
    }
    
    // Test selectors (basic validation)
    const html = response.data;
    const selectorTests = [];
    
    if (selectors.css && selectors.css.length > 0) {
      for (const selector of selectors.css) {
        if (selector.trim()) {
          // Basic CSS selector validation
          const isValid = /^[.#]?[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(selector.trim());
          selectorTests.push({
            selector,
            type: 'css',
            valid: isValid
          });
        }
      }
    }
    
    if (selectors.xpath && selectors.xpath.length > 0) {
      for (const selector of selectors.xpath) {
        if (selector.trim()) {
          // Basic XPath validation
          const isValid = selector.trim().startsWith('//') || selector.trim().startsWith('./');
          selectorTests.push({
            selector,
            type: 'xpath',
            valid: isValid
          });
        }
      }
    }
    
    const invalidSelectors = selectorTests.filter(test => !test.valid);
    
    if (invalidSelectors.length > 0) {
      return res.json({
        success: false,
        error: `Invalid selectors found: ${invalidSelectors.map(s => s.selector).join(', ')}`
      });
    }
    
    res.json({
      success: true,
      message: 'Monitor configuration is valid',
      data: {
        urlAccessible: true,
        statusCode: response.status,
        contentLength: html.length,
        selectorsTested: selectorTests.length
      }
    });
    
  } catch (error) {
    console.error('Error testing monitor:', error);
    
    if (error.code === 'ECONNREFUSED') {
      res.json({
        success: false,
        error: 'Connection refused. Please check the URL and try again.'
      });
    } else if (error.code === 'ENOTFOUND') {
      res.json({
        success: false,
        error: 'Domain not found. Please check the URL and try again.'
      });
    } else if (error.code === 'ECONNABORTED') {
      res.json({
        success: false,
        error: 'Request timeout. The server took too long to respond.'
      });
    } else {
      res.json({
        success: false,
        error: error.message || 'Failed to test monitor configuration'
      });
    }
  }
};

// Get broken monitors
const getBrokenMonitors = async (req, res) => {
  try {
    const brokenMonitors = await Monitor.getBrokenMonitors();
    
    res.json({
      success: true,
      data: brokenMonitors,
      message: 'Broken monitors retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting broken monitors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve broken monitors',
      message: error.message
    });
  }
};

// Get monitor statistics
const getMonitorStats = async (req, res) => {
  try {
    const totalMonitors = await Monitor.count({ where: { isActive: true } });
    const activeMonitors = await Monitor.count({ where: { status: 'active', isActive: true } });
    const brokenMonitors = await Monitor.count({ where: { status: 'broken', isActive: true } });
    const inactiveMonitors = await Monitor.count({ where: { status: 'inactive', isActive: true } });
    
    res.json({
      success: true,
      data: {
        total: totalMonitors,
        active: activeMonitors,
        broken: brokenMonitors,
        inactive: inactiveMonitors
      },
      message: 'Monitor statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting monitor stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitor statistics',
      message: error.message
    });
  }
};

module.exports = {
  getAllMonitors,
  getMonitorById,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  testMonitor,
  getBrokenMonitors,
  getMonitorStats
}; 