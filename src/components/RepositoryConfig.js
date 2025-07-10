import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function RepositoryConfig({ user, onLogout }) {
  const navigate = useNavigate();
  const { repoId } = useParams();
  const isEditing = !!repoId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'github',
    url: '',
    owner: '',
    repo: '',
    defaultBranch: 'main',
    accessToken: '',
    webhookSecret: '',
    deploymentSettings: {
      autoDeploy: false,
      requireApproval: true,
      deploymentBranch: 'main',
      deploymentPath: '/monitors',
      rollbackEnabled: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchRepository();
    }
  }, [repoId]);

  const fetchRepository = async () => {
    try {
      const response = await fetch(`/api/repositories/${repoId}`);
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching repository:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('deploymentSettings.')) {
      const settingName = name.replace('deploymentSettings.', '');
      setFormData(prev => ({
        ...prev,
        deploymentSettings: {
          ...prev.deploymentSettings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, url }));

    // Auto-parse GitHub/GitLab URL
    if (url) {
      const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      const gitlabMatch = url.match(/gitlab\.com\/([^\/]+)\/([^\/]+)/);
      
      if (githubMatch) {
        setFormData(prev => ({
          ...prev,
          provider: 'github',
          owner: githubMatch[1],
          repo: githubMatch[2].replace('.git', '')
        }));
      } else if (gitlabMatch) {
        setFormData(prev => ({
          ...prev,
          provider: 'gitlab',
          owner: gitlabMatch[1],
          repo: gitlabMatch[2].replace('.git', '')
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Repository name is required';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'Repository URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid GitHub or GitLab URL';
    }
    
    if (!formData.owner.trim()) {
      newErrors.owner = 'Repository owner is required';
    }
    
    if (!formData.repo.trim()) {
      newErrors.repo = 'Repository name is required';
    }
    
    if (!formData.accessToken.trim()) {
      newErrors.accessToken = 'Access token is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.hostname === 'github.com' || url.hostname === 'gitlab.com';
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
      const url = isEditing ? `/api/repositories/${repoId}` : '/api/repositories';
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
        setErrors({ submit: data.message || 'Failed to save repository' });
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
      const response = await fetch('/api/repositories/test', {
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
                  {isEditing ? 'Edit Repository' : 'Add Repository'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Configure GitHub or GitLab repository for deployment
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
              <h3 className="text-lg font-medium text-gray-900">Repository Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Repository Name *
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
                    placeholder="e.g., Monitor Scripts"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                    Provider
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
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
                  placeholder="Describe this repository..."
                />
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Repository URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://github.com/username/repository"
                />
                {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                    Owner *
                  </label>
                  <input
                    type="text"
                    id="owner"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.owner ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="username"
                  />
                  {errors.owner && <p className="mt-1 text-sm text-red-600">{errors.owner}</p>}
                </div>

                <div>
                  <label htmlFor="repo" className="block text-sm font-medium text-gray-700">
                    Repository *
                  </label>
                  <input
                    type="text"
                    id="repo"
                    name="repo"
                    value={formData.repo}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.repo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="repository-name"
                  />
                  {errors.repo && <p className="mt-1 text-sm text-red-600">{errors.repo}</p>}
                </div>

                <div>
                  <label htmlFor="defaultBranch" className="block text-sm font-medium text-gray-700">
                    Default Branch
                  </label>
                  <input
                    type="text"
                    id="defaultBranch"
                    name="defaultBranch"
                    value={formData.defaultBranch}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="main"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
                  Access Token *
                </label>
                <input
                  type="password"
                  id="accessToken"
                  name="accessToken"
                  value={formData.accessToken}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.accessToken ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your personal access token"
                />
                {errors.accessToken && <p className="mt-1 text-sm text-red-600">{errors.accessToken}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.provider === 'github' 
                    ? 'Create a GitHub Personal Access Token with repo permissions'
                    : 'Create a GitLab Personal Access Token with api permissions'
                  }
                </p>
              </div>

              <div>
                <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700">
                  Webhook Secret (Optional)
                </label>
                <input
                  type="password"
                  id="webhookSecret"
                  name="webhookSecret"
                  value={formData.webhookSecret}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Webhook secret for deployment notifications"
                />
              </div>
            </div>
          </div>

          {/* Deployment Settings */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Deployment Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deploymentSettings.deploymentBranch" className="block text-sm font-medium text-gray-700">
                    Deployment Branch
                  </label>
                  <input
                    type="text"
                    id="deploymentSettings.deploymentBranch"
                    name="deploymentSettings.deploymentBranch"
                    value={formData.deploymentSettings.deploymentBranch}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="main"
                  />
                </div>

                <div>
                  <label htmlFor="deploymentSettings.deploymentPath" className="block text-sm font-medium text-gray-700">
                    Deployment Path
                  </label>
                  <input
                    type="text"
                    id="deploymentSettings.deploymentPath"
                    name="deploymentSettings.deploymentPath"
                    value={formData.deploymentSettings.deploymentPath}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="/monitors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="deploymentSettings.autoDeploy"
                    name="deploymentSettings.autoDeploy"
                    type="checkbox"
                    checked={formData.deploymentSettings.autoDeploy}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deploymentSettings.autoDeploy" className="ml-2 block text-sm text-gray-900">
                    Enable automatic deployment
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="deploymentSettings.requireApproval"
                    name="deploymentSettings.requireApproval"
                    type="checkbox"
                    checked={formData.deploymentSettings.requireApproval}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deploymentSettings.requireApproval" className="ml-2 block text-sm text-gray-900">
                    Require approval before deployment
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="deploymentSettings.rollbackEnabled"
                    name="deploymentSettings.rollbackEnabled"
                    type="checkbox"
                    checked={formData.deploymentSettings.rollbackEnabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deploymentSettings.rollbackEnabled" className="ml-2 block text-sm text-gray-900">
                    Enable rollback functionality
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`bg-white shadow-sm rounded-lg border ${
              testResult.success ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Connection Test Results</h3>
              </div>
              <div className="p-6">
                {testResult.success ? (
                  <div className="text-green-700">
                    <p>✅ Connection successful! Repository is accessible.</p>
                    {testResult.data && (
                      <div className="mt-2 text-sm">
                        <p><strong>Repository:</strong> {testResult.data.full_name || testResult.data.path_with_namespace}</p>
                        <p><strong>Description:</strong> {testResult.data.description || 'No description'}</p>
                        <p><strong>Default Branch:</strong> {testResult.data.default_branch}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p>❌ Connection failed: {testResult.error}</p>
                    {testResult.status && (
                      <p className="text-sm mt-1">Status: {testResult.status}</p>
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
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Test Connection
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
                {loading ? 'Saving...' : (isEditing ? 'Update Repository' : 'Add Repository')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RepositoryConfig; 