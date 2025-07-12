import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function MonitorForm({ user, onLogout }) {
  const navigate = useNavigate();
  const { monitorId } = useParams();
  const isEditing = !!monitorId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUrl: '',
    monitorType: 'web_scraping',
    frequency: 30,
    selectors: {
      css: [''],
      xpath: ['']
    },
    dataMapping: {},
    // Enhanced GitHub Repository Configuration
    scraperRepository: {
      url: '',
      branch: 'main',
      scriptPath: '',
      deploymentPath: '',
      accessToken: ''
    },
    // Scraper Performance Monitoring
    performanceMetrics: {
      maxResponseTime: 30000,
      minSuccessRate: 95,
      alertThreshold: 5,
      enablePerformanceAlerts: true,
      trackMemoryUsage: true,
      trackCpuUsage: true
    },
    // Scraper Quality Monitoring
    qualityChecks: {
      dataValidation: true,
      schemaValidation: true,
      duplicateDetection: true,
      missingDataAlerts: true,
      qualityThreshold: 90,
      expectedDataPoints: 0,
      enableQualityAlerts: true
    },
    // Deployment Configuration
    deploymentConfig: {
      environment: 'production',
      autoDeployOnChange: false,
      deploymentPlatform: 'github_actions',
      dockerImage: '',
      environmentVariables: {}
    },
    repository: '',
    filePath: '',
    branch: 'main',
    timeout: 30000,
    retryAttempts: 3
  });

  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    fetchRepositories();
    if (isEditing) {
      fetchMonitor();
    }
  }, [monitorId]);

  const fetchRepositories = async () => {
    try {
      const response = await fetch('/api/repositories');
      const data = await response.json();
      if (data.success) {
        setRepositories(data.data);
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const fetchGithubRepos = async (accessToken) => {
    if (!accessToken) return;
    
    setLoadingRepos(true);
    try {
      const response = await fetch('/api/github/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });
      const data = await response.json();
      if (data.success) {
        setGithubRepos(data.repositories);
      }
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchMonitor = async () => {
    try {
      const response = await fetch(`/api/monitors/${monitorId}`);
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching monitor:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  const handleSelectorChange = (type, index, value) => {
    setFormData(prev => ({
      ...prev,
      selectors: {
        ...prev.selectors,
        [type]: prev.selectors[type].map((selector, i) => 
          i === index ? value : selector
        )
      }
    }));
  };

  const addSelector = (type) => {
    setFormData(prev => ({
      ...prev,
      selectors: {
        ...prev.selectors,
        [type]: [...prev.selectors[type], '']
      }
    }));
  };

  const removeSelector = (type, index) => {
    setFormData(prev => ({
      ...prev,
      selectors: {
        ...prev.selectors,
        [type]: prev.selectors[type].filter((_, i) => i !== index)
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Monitor name is required';
    }
    
    if (!formData.targetUrl.trim()) {
      newErrors.targetUrl = 'Target URL is required';
    } else if (!isValidUrl(formData.targetUrl)) {
      newErrors.targetUrl = 'Please enter a valid URL';
    }
    
    if (formData.frequency < 1) {
      newErrors.frequency = 'Frequency must be at least 1 minute';
    }
    
    if (formData.timeout < 1000) {
      newErrors.timeout = 'Timeout must be at least 1000ms';
    }

    // Validate scraper repository
    if (!formData.scraperRepository.url.trim()) {
      newErrors.scraperRepository = 'Scraper GitHub repository URL is required';
    }

    if (!formData.scraperRepository.scriptPath.trim()) {
      newErrors.scriptPath = 'Scraper script path is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const url = isEditing ? `/api/monitors/${monitorId}` : '/api/monitors';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user.username,
          updatedBy: user.username
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate('/dashboard');
      } else {
        setErrors({ submit: data.message || 'Failed to save monitor' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/monitors/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ success: false, error: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Edit Scraper Monitor' : 'Add New Scraper Monitor'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Configure scraper performance and quality monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Monitor Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., E-commerce Price Scraper Monitor"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="monitorType" className="block text-sm font-medium text-gray-700">
                    Monitor Type
                  </label>
                  <select
                    id="monitorType"
                    name="monitorType"
                    value={formData.monitorType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="web_scraping">Web Scraping</option>
                    <option value="api_monitoring">API Monitoring</option>
                    <option value="price_tracking">Price Tracking</option>
                    <option value="content_monitoring">Content Monitoring</option>
                    <option value="data_extraction">Data Extraction</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe what this scraper monitors and what data it collects..."
                />
              </div>

              <div>
                <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">
                  Target URL *
                </label>
                <input
                  type="url"
                  id="targetUrl"
                  name="targetUrl"
                  value={formData.targetUrl}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.targetUrl ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/products"
                />
                {errors.targetUrl && <p className="mt-1 text-sm text-red-600">{errors.targetUrl}</p>}
              </div>
            </div>
          </div>

          {/* Scraper GitHub Repository Configuration */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Scraper Repository Configuration</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect your scraper GitHub repository for deployment and monitoring
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="scraperRepoUrl" className="block text-sm font-medium text-gray-700">
                    GitHub Repository URL *
                  </label>
                  <input
                    type="url"
                    id="scraperRepoUrl"
                    value={formData.scraperRepository.url}
                    onChange={(e) => handleNestedInputChange('scraperRepository', 'url', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.scraperRepository ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://github.com/username/scraper-repo"
                  />
                  {errors.scraperRepository && <p className="mt-1 text-sm text-red-600">{errors.scraperRepository}</p>}
                </div>

                <div>
                  <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
                    GitHub Access Token
                  </label>
                  <input
                    type="password"
                    id="accessToken"
                    value={formData.scraperRepository.accessToken}
                    onChange={(e) => {
                      handleNestedInputChange('scraperRepository', 'accessToken', e.target.value);
                      if (e.target.value) {
                        fetchGithubRepos(e.target.value);
                      }
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Required for private repositories and deployment
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Branch
                  </label>
                  <input
                    type="text"
                    id="branch"
                    value={formData.scraperRepository.branch}
                    onChange={(e) => handleNestedInputChange('scraperRepository', 'branch', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="main"
                  />
                </div>

                <div>
                  <label htmlFor="scriptPath" className="block text-sm font-medium text-gray-700">
                    Scraper Script Path *
                  </label>
                  <input
                    type="text"
                    id="scriptPath"
                    value={formData.scraperRepository.scriptPath}
                    onChange={(e) => handleNestedInputChange('scraperRepository', 'scriptPath', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.scriptPath ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="src/scraper.py"
                  />
                  {errors.scriptPath && <p className="mt-1 text-sm text-red-600">{errors.scriptPath}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="deploymentPath" className="block text-sm font-medium text-gray-700">
                  Deployment Path
                </label>
                <input
                  type="text"
                  id="deploymentPath"
                  value={formData.scraperRepository.deploymentPath}
                  onChange={(e) => handleNestedInputChange('scraperRepository', 'deploymentPath', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="deployment/"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Path where deployment configurations will be stored
                </p>
              </div>

              {loadingRepos && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading repositories...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scraper Performance Monitoring */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Performance Monitoring</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure performance thresholds and monitoring settings
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="maxResponseTime" className="block text-sm font-medium text-gray-700">
                    Max Response Time (ms)
                  </label>
                  <input
                    type="number"
                    id="maxResponseTime"
                    value={formData.performanceMetrics.maxResponseTime}
                    onChange={(e) => handleNestedInputChange('performanceMetrics', 'maxResponseTime', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="1000"
                  />
                </div>

                <div>
                  <label htmlFor="minSuccessRate" className="block text-sm font-medium text-gray-700">
                    Min Success Rate (%)
                  </label>
                  <input
                    type="number"
                    id="minSuccessRate"
                    value={formData.performanceMetrics.minSuccessRate}
                    onChange={(e) => handleNestedInputChange('performanceMetrics', 'minSuccessRate', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700">
                    Alert Threshold (failures)
                  </label>
                  <input
                    type="number"
                    id="alertThreshold"
                    value={formData.performanceMetrics.alertThreshold}
                    onChange={(e) => handleNestedInputChange('performanceMetrics', 'alertThreshold', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enablePerformanceAlerts"
                    checked={formData.performanceMetrics.enablePerformanceAlerts}
                    onChange={() => handleCheckboxChange('performanceMetrics', 'enablePerformanceAlerts')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enablePerformanceAlerts" className="ml-2 block text-sm text-gray-900">
                    Enable Performance Alerts
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackMemoryUsage"
                    checked={formData.performanceMetrics.trackMemoryUsage}
                    onChange={() => handleCheckboxChange('performanceMetrics', 'trackMemoryUsage')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trackMemoryUsage" className="ml-2 block text-sm text-gray-900">
                    Track Memory Usage
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackCpuUsage"
                    checked={formData.performanceMetrics.trackCpuUsage}
                    onChange={() => handleCheckboxChange('performanceMetrics', 'trackCpuUsage')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trackCpuUsage" className="ml-2 block text-sm text-gray-900">
                    Track CPU Usage
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Scraper Quality Monitoring */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quality Monitoring</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure data quality checks and validation rules
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="qualityThreshold" className="block text-sm font-medium text-gray-700">
                    Quality Threshold (%)
                  </label>
                  <input
                    type="number"
                    id="qualityThreshold"
                    value={formData.qualityChecks.qualityThreshold}
                    onChange={(e) => handleNestedInputChange('qualityChecks', 'qualityThreshold', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label htmlFor="expectedDataPoints" className="block text-sm font-medium text-gray-700">
                    Expected Data Points
                  </label>
                  <input
                    type="number"
                    id="expectedDataPoints"
                    value={formData.qualityChecks.expectedDataPoints}
                    onChange={(e) => handleNestedInputChange('qualityChecks', 'expectedDataPoints', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dataValidation"
                      checked={formData.qualityChecks.dataValidation}
                      onChange={() => handleCheckboxChange('qualityChecks', 'dataValidation')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dataValidation" className="ml-2 block text-sm text-gray-900">
                      Enable Data Validation
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="schemaValidation"
                      checked={formData.qualityChecks.schemaValidation}
                      onChange={() => handleCheckboxChange('qualityChecks', 'schemaValidation')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="schemaValidation" className="ml-2 block text-sm text-gray-900">
                      Enable Schema Validation
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="duplicateDetection"
                      checked={formData.qualityChecks.duplicateDetection}
                      onChange={() => handleCheckboxChange('qualityChecks', 'duplicateDetection')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="duplicateDetection" className="ml-2 block text-sm text-gray-900">
                      Enable Duplicate Detection
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="missingDataAlerts"
                      checked={formData.qualityChecks.missingDataAlerts}
                      onChange={() => handleCheckboxChange('qualityChecks', 'missingDataAlerts')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="missingDataAlerts" className="ml-2 block text-sm text-gray-900">
                      Missing Data Alerts
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableQualityAlerts"
                  checked={formData.qualityChecks.enableQualityAlerts}
                  onChange={() => handleCheckboxChange('qualityChecks', 'enableQualityAlerts')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableQualityAlerts" className="ml-2 block text-sm text-gray-900">
                  Enable Quality Alerts
                </label>
              </div>
            </div>
          </div>

          {/* Deployment Configuration */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Deployment Configuration</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure how the scraper should be deployed and managed
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
                    Environment
                  </label>
                  <select
                    id="environment"
                    value={formData.deploymentConfig.environment}
                    onChange={(e) => handleNestedInputChange('deploymentConfig', 'environment', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="deploymentPlatform" className="block text-sm font-medium text-gray-700">
                    Deployment Platform
                  </label>
                  <select
                    id="deploymentPlatform"
                    value={formData.deploymentConfig.deploymentPlatform}
                    onChange={(e) => handleNestedInputChange('deploymentConfig', 'deploymentPlatform', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="github_actions">GitHub Actions</option>
                    <option value="docker">Docker</option>
                    <option value="kubernetes">Kubernetes</option>
                    <option value="aws_lambda">AWS Lambda</option>
                    <option value="heroku">Heroku</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dockerImage" className="block text-sm font-medium text-gray-700">
                  Docker Image (Optional)
                </label>
                <input
                  type="text"
                  id="dockerImage"
                  value={formData.deploymentConfig.dockerImage}
                  onChange={(e) => handleNestedInputChange('deploymentConfig', 'dockerImage', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="python:3.9-slim"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoDeployOnChange"
                  checked={formData.deploymentConfig.autoDeployOnChange}
                  onChange={() => handleCheckboxChange('deploymentConfig', 'autoDeployOnChange')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoDeployOnChange" className="ml-2 block text-sm text-gray-900">
                  Auto-deploy on Repository Changes
                </label>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">General Configuration</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                    Check Frequency (minutes)
                  </label>
                  <input
                    type="number"
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    min="1"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.frequency ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
                </div>

                <div>
                  <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    id="timeout"
                    name="timeout"
                    value={formData.timeout}
                    onChange={handleInputChange}
                    min="1000"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.timeout ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.timeout && <p className="mt-1 text-sm text-red-600">{errors.timeout}</p>}
                </div>

                <div>
                  <label htmlFor="retryAttempts" className="block text-sm font-medium text-gray-700">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    id="retryAttempts"
                    name="retryAttempts"
                    value={formData.retryAttempts}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Selectors */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Data Selectors</h3>
              <p className="mt-1 text-sm text-gray-500">
                Define CSS selectors or XPath expressions to extract data
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* CSS Selectors */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">CSS Selectors</h4>
                  <button
                    type="button"
                    onClick={() => addSelector('css')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Selector
                  </button>
                </div>
                {formData.selectors.css.map((selector, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={selector}
                      onChange={(e) => handleSelectorChange('css', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., .price, #title, div.product"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelector('css', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* XPath Selectors */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">XPath Selectors</h4>
                  <button
                    type="button"
                    onClick={() => addSelector('xpath')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Selector
                  </button>
                </div>
                {formData.selectors.xpath.map((selector, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={selector}
                      onChange={(e) => handleSelectorChange('xpath', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., //div[@class='price'], //h1[@id='title']"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelector('xpath', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legacy Repository Configuration */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Legacy Repository Configuration</h3>
              <p className="mt-1 text-sm text-gray-500">
                Optional: Connect to existing repository configuration
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="repository" className="block text-sm font-medium text-gray-700">
                    Repository
                  </label>
                  <select
                    id="repository"
                    name="repository"
                    value={formData.repository}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a repository</option>
                    {repositories.map(repo => (
                      <option key={repo._id} value={repo._id}>
                        {repo.name} ({repo.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Branch
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="main"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="filePath" className="block text-sm font-medium text-gray-700">
                  File Path
                </label>
                <input
                  type="text"
                  id="filePath"
                  name="filePath"
                  value={formData.filePath}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., /monitors/bank_monitor.py"
                />
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`bg-white shadow-sm rounded-lg border ${
              testResult.success ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
              </div>
              <div className="p-6">
                {testResult.success ? (
                  <div className="text-green-700">
                    <p>✅ Test successful! Scraper configuration is valid.</p>
                    {testResult.performance && (
                      <div className="mt-4 p-4 bg-green-50 rounded-md">
                        <h4 className="font-medium">Performance Metrics:</h4>
                        <ul className="mt-2 text-sm">
                          <li>Response Time: {testResult.performance.responseTime}ms</li>
                          <li>Data Points Extracted: {testResult.performance.dataPoints}</li>
                          <li>Success Rate: {testResult.performance.successRate}%</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p>❌ Test failed: {testResult.error}</p>
                    {testResult.suggestions && (
                      <div className="mt-4 p-4 bg-red-50 rounded-md">
                        <h4 className="font-medium">Suggestions:</h4>
                        <ul className="mt-2 text-sm list-disc list-inside">
                          {testResult.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleTest}
                disabled={loading}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Test Scraper Configuration
              </button>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Scraper Monitor' : 'Create Scraper Monitor')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MonitorForm; 