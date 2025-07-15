import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

function MonitorForm({ user, onLogout, onAddMonitor }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    targetUrl: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one scraper file.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('targetUrl', formData.targetUrl);
      
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append('scraperFiles', file);
      });

      // Call the API through the parent component with FormData
      await onAddMonitor(formDataToSend);
      
      // Navigate back to dashboard after successful creation
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create monitor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(file => {
      // Allow common programming file extensions
      const allowedExtensions = [
        '.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.php', '.java', '.cs', 
        '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml', '.fs',
        '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.txt',
        '.md', '.html', '.css', '.scss', '.sass', '.less'
      ];
      
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      return allowedExtensions.includes(fileExtension);
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only programming files are allowed.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={onLogout} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-primary-600 hover:underline flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Monitor</h1>
          <p className="mt-2 text-gray-600">Create a new web scraping monitor with your scraper project files</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-danger-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Monitor Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Monitor Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Amazon Price Tracker"
              />
              <p className="mt-1 text-xs text-gray-500">Give your monitor a descriptive name</p>
            </div>

            {/* Target URL */}
            <div>
              <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Target URL *
              </label>
              <input
                type="url"
                id="targetUrl"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com"
              />
              <p className="mt-1 text-xs text-gray-500">The website URL you want to scrape</p>
            </div>

            {/* Scraper Files Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scraper Project Files *
              </label>
              
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  isDragOver 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragOver ? 'Drop your files here' : 'Upload your scraper project files'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag and drop files here, or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        browse files
                      </button>
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".js,.ts,.jsx,.tsx,.py,.rb,.php,.java,.cs,.go,.rs,.swift,.kt,.scala,.clj,.hs,.ml,.fs,.json,.yaml,.yml,.toml,.ini,.cfg,.conf,.txt,.md,.html,.css,.scss,.sass,.less"
                  />
                </div>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getFileIcon(file.name)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Upload all files from your scraper project. Supported formats: JavaScript, TypeScript, Python, Ruby, PHP, Java, C#, Go, Rust, and more.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || uploadedFiles.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Monitor...
                  </div>
                ) : (
                  'Create Monitor'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Upload all files from your scraper project (main script, dependencies, config files)</p>
            <p>• Make sure your target URL is accessible and doesn't require authentication</p>
            <p>• Include any package.json, requirements.txt, or dependency files</p>
            <p>• Your scraper should have a clear entry point (main function or script)</p>
            <p>• The system will automatically retry failed scrapes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonitorForm; 