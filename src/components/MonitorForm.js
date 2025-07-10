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
                  {isEditing ? 'Edit Monitor' : 'Add New Monitor'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Configure a new monitoring system
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
                    placeholder="e.g., Bank Account Monitor"
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
                  placeholder="Describe what this monitor does..."
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
                  placeholder="https://example.com"
                />
                {errors.targetUrl && <p className="mt-1 text-sm text-red-600">{errors.targetUrl}</p>}
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
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

          {/* Selectors */}
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

          {/* Repository Configuration */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Repository Configuration</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect this monitor to a repository for deployment
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
                    <p>✅ Test successful! Monitor configuration is valid.</p>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p>❌ Test failed: {testResult.error}</p>
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
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Test Configuration
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
                {loading ? 'Saving...' : (isEditing ? 'Update Monitor' : 'Create Monitor')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MonitorForm; 