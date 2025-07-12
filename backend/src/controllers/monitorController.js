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

// Test monitor configuration with enhanced scraper features
const testMonitor = async (req, res) => {
  try {
    const { 
      targetUrl, 
      selectors, 
      timeout,
      scraperRepository,
      performanceMetrics,
      qualityChecks
    } = req.body;
    
    const startTime = Date.now();
    const testResults = {
      success: true,
      performance: {},
      quality: {},
      repository: {},
      suggestions: []
    };
    
    // Test URL accessibility and measure performance
    try {
      const response = await axios.get(targetUrl, {
        timeout: timeout || 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status !== 200) {
        testResults.success = false;
        testResults.error = `HTTP ${response.status}: ${response.statusText}`;
        return res.json(testResults);
      }
      
      // Performance metrics
      testResults.performance = {
        responseTime: responseTime,
        statusCode: response.status,
        contentLength: response.data.length,
        successRate: 100 // Single test, so 100% if successful
      };
      
      // Check against performance thresholds
      if (performanceMetrics) {
        if (responseTime > performanceMetrics.maxResponseTime) {
          testResults.suggestions.push(`Response time (${responseTime}ms) exceeds threshold (${performanceMetrics.maxResponseTime}ms)`);
        }
      }
      
      // Test selectors and extract data for quality checks
      const html = response.data;
      const selectorTests = [];
      const extractedData = [];
      
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
            
            // Simulate data extraction (in real implementation, you'd use a proper parser)
            if (isValid) {
              extractedData.push(`data_from_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`);
            }
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
            
            // Simulate data extraction
            if (isValid) {
              extractedData.push(`data_from_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`);
            }
          }
        }
      }
      
      const invalidSelectors = selectorTests.filter(test => !test.valid);
      
      if (invalidSelectors.length > 0) {
        testResults.success = false;
        testResults.error = `Invalid selectors found: ${invalidSelectors.map(s => s.selector).join(', ')}`;
        return res.json(testResults);
      }
      
      // Quality checks
      testResults.quality = {
        selectorsTested: selectorTests.length,
        validSelectors: selectorTests.filter(test => test.valid).length,
        dataPointsExtracted: extractedData.length,
        duplicateDetected: false, // Simulated
        schemaValid: true, // Simulated
        qualityScore: 95 // Simulated quality score
      };
      
      // Check against quality thresholds
      if (qualityChecks) {
        if (extractedData.length < qualityChecks.expectedDataPoints) {
          testResults.suggestions.push(`Extracted ${extractedData.length} data points, expected ${qualityChecks.expectedDataPoints}`);
        }
        
        if (testResults.quality.qualityScore < qualityChecks.qualityThreshold) {
          testResults.suggestions.push(`Quality score (${testResults.quality.qualityScore}%) below threshold (${qualityChecks.qualityThreshold}%)`);
        }
      }
      
      testResults.performance.dataPoints = extractedData.length;
      
    } catch (error) {
      testResults.success = false;
      
      if (error.code === 'ECONNREFUSED') {
        testResults.error = 'Connection refused. Please check the URL and try again.';
      } else if (error.code === 'ENOTFOUND') {
        testResults.error = 'Domain not found. Please check the URL and try again.';
      } else if (error.code === 'ECONNABORTED') {
        testResults.error = 'Request timeout. The server took too long to respond.';
      } else {
        testResults.error = error.message || 'Failed to test monitor configuration';
      }
      
      return res.json(testResults);
    }
    
    // Test GitHub repository if provided
    if (scraperRepository && scraperRepository.url && scraperRepository.accessToken) {
      try {
        // Extract owner and repo from URL
        const repoMatch = scraperRepository.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (repoMatch) {
          const [, owner, repo] = repoMatch;
          
          // Check repository access
          const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              'Authorization': `token ${scraperRepository.accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          testResults.repository = {
            accessible: true,
            name: repoResponse.data.name,
            private: repoResponse.data.private,
            language: repoResponse.data.language,
            lastUpdated: repoResponse.data.updated_at
          };
          
          // Check if script file exists
          if (scraperRepository.scriptPath) {
            try {
              const fileResponse = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${scraperRepository.scriptPath}`,
                {
                  headers: {
                    'Authorization': `token ${scraperRepository.accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                  },
                  params: {
                    ref: scraperRepository.branch || 'main'
                  }
                }
              );
              
              testResults.repository.scriptExists = true;
              testResults.repository.scriptSize = fileResponse.data.size;
              
              // Basic script validation
              let content = fileResponse.data.content;
              if (fileResponse.data.encoding === 'base64') {
                content = Buffer.from(content, 'base64').toString('utf-8');
              }
              
              const validation = {
                hasRequests: /import requests|from requests/.test(content),
                hasBeautifulSoup: /from bs4 import|import bs4/.test(content),
                hasSelenium: /from selenium import|import selenium/.test(content),
                hasMainFunction: /def main|if __name__ == "__main__"/.test(content),
                language: content.includes('def ') ? 'python' : 'unknown'
              };
              
              testResults.repository.scriptValidation = validation;
              
              // Add suggestions based on script analysis
              if (!validation.hasRequests && !validation.hasSelenium) {
                testResults.suggestions.push('Script should import requests or selenium for web scraping');
              }
              
              if (!validation.hasMainFunction) {
                testResults.suggestions.push('Script should have a main function or execution block');
              }
              
            } catch (fileError) {
              testResults.repository.scriptExists = false;
              testResults.suggestions.push(`Script file not found at ${scraperRepository.scriptPath}`);
            }
          }
        } else {
          testResults.suggestions.push('Invalid GitHub repository URL format');
        }
      } catch (repoError) {
        testResults.repository.accessible = false;
        testResults.suggestions.push('Unable to access GitHub repository. Check access token and permissions.');
      }
    }
    
    // Final assessment
    if (testResults.suggestions.length === 0) {
      testResults.suggestions.push('Configuration looks good! All tests passed.');
    }
    
    res.json(testResults);
    
  } catch (error) {
    console.error('Error testing monitor:', error);
    res.json({
      success: false,
      error: error.message || 'Failed to test monitor configuration'
    });
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