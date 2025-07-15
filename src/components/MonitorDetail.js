import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

function MonitorDetail({ scrapers, user, onLogout }) {
  const { monitorId } = useParams();
  const navigate = useNavigate();
  const monitor = scrapers.find(s => s.id === monitorId);
  const [activeTab, setActiveTab] = useState('overview');
  const [retestStatus, setRetestStatus] = useState(null);
  const [retestLoading, setRetestLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (monitor) {
      // Load monitor history and analysis
      loadMonitorData();
    }
  }, [monitor]);

  const loadMonitorData = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch this from your backend
      // For now, we'll simulate the data
      const mockHistory = [
        {
          id: 1,
          version: '1.2.0',
          description: 'Fixed selector issues and improved error handling',
          timestamp: '2024-01-15T10:30:00Z',
          createdBy: 'user@example.com',
          code: `// Updated scraper code
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('${monitor?.targetUrl || 'https://example.com'}');
    
    // Improved error handling
    const data = await page.evaluate(() => {
      const elements = document.querySelectorAll('.product-item');
      return Array.from(elements).map(el => ({
        title: el.querySelector('.title')?.textContent || '',
        price: el.querySelector('.price')?.textContent || '',
        link: el.querySelector('a')?.href || ''
      }));
    });
    
    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

module.exports = scrape;`
        },
        {
          id: 2,
          version: '1.1.0',
          description: 'Added retry mechanism and timeout handling',
          timestamp: '2024-01-10T14:20:00Z',
          createdBy: 'user@example.com',
          code: `// Previous version with retry logic
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('${monitor?.targetUrl || 'https://example.com'}', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  const data = await page.evaluate(() => {
    return {
      title: document.title,
      content: document.body.textContent
    };
  });
  
  await browser.close();
  return data;
}

module.exports = scrape;`
        },
        {
          id: 3,
          version: '1.0.0',
          description: 'Initial scraper implementation',
          timestamp: '2024-01-05T09:15:00Z',
          createdBy: 'user@example.com',
          code: `// Initial scraper code
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('${monitor?.targetUrl || 'https://example.com'}');
  
  const data = await page.evaluate(() => {
    return {
      title: document.title
    };
  });
  
  await browser.close();
  return data;
}

module.exports = scrape;`
        }
      ];

      const mockAnalysis = {
        totalRuns: 156,
        successRate: 94.2,
        averageResponseTime: 2.3,
        lastAnalysis: '2024-01-15T12:00:00Z',
        errorPatterns: [
          { type: 'Timeout', count: 8, percentage: 5.1 },
          { type: 'Selector Not Found', count: 3, percentage: 1.9 },
          { type: 'Network Error', count: 2, percentage: 1.3 }
        ],
        performanceTrends: [
          { date: '2024-01-10', responseTime: 2.1, successRate: 96.5 },
          { date: '2024-01-11', responseTime: 2.4, successRate: 93.2 },
          { date: '2024-01-12', responseTime: 2.0, successRate: 97.1 },
          { date: '2024-01-13', responseTime: 2.5, successRate: 92.8 },
          { date: '2024-01-14', responseTime: 2.2, successRate: 95.3 },
          { date: '2024-01-15', responseTime: 2.3, successRate: 94.2 }
        ]
      };

      setHistory(mockHistory);
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error loading monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!monitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Monitor Not Found</h1>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const handleRetest = async () => {
    setRetestLoading(true);
    setRetestStatus(null);
    // Simulate retest
    await new Promise(res => setTimeout(res, 1200));
    // Randomly pass/fail for demo
    const success = Math.random() > 0.3;
    setRetestStatus(success ? 'success' : 'fail');
    setRetestLoading(false);
  };

  const downloadFile = (file) => {
    // In a real app, this would download from the backend
    const blob = new Blob([file.content || 'File content'], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      js: '📄', ts: '📄', jsx: '⚛️', tsx: '⚛️', py: '🐍', rb: '💎', php: '🐘',
      java: '☕', cs: '🔷', go: '🐹', rs: '🦀', swift: '🍎', kt: '☕',
      json: '📋', yaml: '📋', yml: '📋', toml: '📋', md: '📝', html: '🌐',
      css: '🎨', scss: '🎨', sass: '🎨', less: '🎨'
    };
    return iconMap[extension] || '📄';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'history', name: 'History', icon: '📜' },
    { id: 'analysis', name: 'Analysis', icon: '📈' },
    { id: 'files', name: 'Files', icon: '📁' },
    { id: 'code', name: 'Code', icon: '💻' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="mb-4 text-primary-600 hover:underline flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{monitor.name}</h1>
              <p className="mt-2 text-gray-600">{monitor.targetUrl}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                monitor.status === 'Working' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
              }`}>
                {monitor.status === 'Working' ? 'Operational' : 'Needs Attention'}
              </span>
              <button
                onClick={handleRetest}
                disabled={retestLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {retestLoading ? 'Retesting...' : 'Retest Connection'}
              </button>
            </div>
          </div>
          
          {retestStatus === 'success' && (
            <div className="mt-4 bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-success-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-success-700 font-medium">Connection test successful!</span>
              </div>
            </div>
          )}
          
          {retestStatus === 'fail' && (
            <div className="mt-4 bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-danger-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-danger-700 font-medium">Connection test failed. Check your configuration.</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200">
          {activeTab === 'overview' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Monitor Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Status</h3>
                  <p className="text-3xl font-bold text-primary-600">{monitor.status}</p>
                  <p className="text-sm text-gray-500 mt-1">Current status</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Last Check</h3>
                  <p className="text-lg font-semibold text-gray-900">{monitor.lastChecked}</p>
                  <p className="text-sm text-gray-500 mt-1">Last monitoring run</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Last Action</h3>
                  <p className="text-sm text-gray-900">{monitor.lastAction}</p>
                  <p className="text-sm text-gray-500 mt-1">Most recent activity</p>
                </div>
              </div>

              {monitor.errorSummary && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-danger-900 mb-3">Error Summary</h3>
                  <p className="text-danger-700">{monitor.errorSummary}</p>
                </div>
              )}

              {monitor.files && monitor.files.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monitor.files.map((file, index) => (
                      <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                        <span className="text-2xl mr-3">{getFileIcon(file.name)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => downloadFile(file)}
                          className="ml-2 p-1 text-gray-400 hover:text-primary-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Code History</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading history...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((version) => (
                    <div key={version.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Version {version.version}</h3>
                          <p className="text-sm text-gray-500">{version.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(version.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">{version.createdBy}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm">
                          <code>{version.code}</code>
                        </pre>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => downloadFile({ name: `scraper-v${version.version}.js`, content: version.code })}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          Download
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          Compare
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analysis</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading analysis...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-8">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">Total Runs</h3>
                      <p className="text-3xl font-bold text-blue-600">{analysis.totalRuns}</p>
                      <p className="text-sm text-blue-700 mt-1">All time executions</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-green-900 mb-2">Success Rate</h3>
                      <p className="text-3xl font-bold text-green-600">{analysis.successRate}%</p>
                      <p className="text-sm text-green-700 mt-1">Successful executions</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-purple-900 mb-2">Avg Response</h3>
                      <p className="text-3xl font-bold text-purple-600">{analysis.averageResponseTime}s</p>
                      <p className="text-sm text-purple-700 mt-1">Average execution time</p>
                    </div>
                  </div>

                  {/* Error Patterns */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Error Patterns</h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analysis.errorPatterns.map((error, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{error.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{error.count}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{error.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Performance Trends */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends (Last 6 Days)</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="grid grid-cols-6 gap-4">
                        {analysis.performanceTrends.map((trend, index) => (
                          <div key={index} className="text-center">
                            <p className="text-sm font-medium text-gray-900">{new Date(trend.date).toLocaleDateString()}</p>
                            <p className="text-lg font-bold text-primary-600">{trend.responseTime}s</p>
                            <p className="text-xs text-gray-500">{trend.successRate}% success</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No analysis data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Files</h2>
              
              {monitor.files && monitor.files.length > 0 ? (
                <div className="space-y-4">
                  {monitor.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getFileIcon(file.name)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.type}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadFile(file)}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          Download
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No files uploaded for this monitor</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Code</h2>
              
              {monitor.currentCode ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Latest version of the scraper code</p>
                    <button
                      onClick={() => downloadFile({ name: 'current-scraper.js', content: monitor.currentCode })}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Download
                    </button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                      <code>{monitor.currentCode}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="mt-2 text-gray-500">No code available for this monitor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonitorDetail; 