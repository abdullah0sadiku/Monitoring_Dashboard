import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DeploymentService from '../services/deploymentService';

function DeploymentReview({ scrapers, prLinks }) {
  const { scraperId } = useParams();
  const navigate = useNavigate();
  const scraper = scrapers.find(s => s.id === scraperId);
  const prUrl = prLinks[scraperId];
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [prDetails, setPrDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scraper && prUrl) {
      loadDeploymentDetails();
    }
  }, [scraper, prUrl]);

  const loadDeploymentDetails = async () => {
    setLoading(true);
    try {
      // Mock PR details
      const prNumber = prUrl.split('/').pop();
      setPrDetails({
        number: prNumber,
        title: `Fix: Update ${scraper.name} monitor configuration`,
        state: 'open',
        author: 'AI System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mergeable: true,
        checks: {
          total: 4,
          passed: 4,
          failed: 0,
          pending: 0
        },
        files: [
          {
            filename: `monitors/${scraper.id}/config.py`,
            status: 'modified',
            additions: 12,
            deletions: 8,
            changes: 20
          },
          {
            filename: `monitors/${scraper.id}/selectors.json`,
            status: 'modified',
            additions: 3,
            deletions: 1,
            changes: 4
          }
        ],
        commits: [
          {
            sha: 'abc123def456',
            message: 'Fix: Update selector for new page structure',
            author: 'AI System',
            date: new Date().toISOString()
          }
        ]
      });

      // Mock deployment status
      setDeploymentStatus({
        id: `deploy_${Date.now()}`,
        status: 'success',
        environment: 'production',
        deployedAt: new Date().toISOString(),
        logs: [
          'Starting deployment...',
          'Validating configuration...',
          'Running tests...',
          'Deploying to production...',
          'Deployment completed successfully'
        ]
      });
    } catch (error) {
      console.error('Failed to load deployment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMergePR = async () => {
    try {
      // In a real implementation, this would call the GitHub API
      alert('PR merged successfully! The fix is now live in production.');
      navigate('/');
    } catch (error) {
      alert('Failed to merge PR. Please try again.');
    }
  };

  const handleRollback = async () => {
    if (window.confirm('Are you sure you want to rollback this deployment?')) {
      try {
        await DeploymentService.rollbackDeployment(deploymentStatus.id);
        alert('Deployment rolled back successfully.');
        navigate('/');
      } catch (error) {
        alert('Failed to rollback deployment.');
      }
    }
  };

  if (!scraper || !prUrl) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="text-red-600 text-lg font-medium">Deployment not found.</div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')} 
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Deployment Review</h1>
                <p className="mt-1 text-sm text-gray-500">{scraper.name} - PR #{prDetails?.number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Deployed
              </span>
              <a
                href={prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pull Request Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Pull Request Details</h3>
                    <p className="text-sm text-gray-500">GitHub integration and change summary</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">PR Information</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Number:</dt>
                        <dd className="text-sm text-gray-900">#{prDetails?.number}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Status:</dt>
                        <dd className="text-sm text-gray-900 capitalize">{prDetails?.state}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Author:</dt>
                        <dd className="text-sm text-gray-900">{prDetails?.author}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Created:</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(prDetails?.createdAt).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Status Checks</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-800">
                          All checks passed ({prDetails?.checks.passed}/{prDetails?.checks.total})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Files Changed</h4>
                    <div className="space-y-2">
                      {prDetails?.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              file.status === 'modified' ? 'bg-yellow-400' : 'bg-green-400'
                            }`}></div>
                            <span className="text-sm text-gray-900 font-mono">{file.filename}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="text-green-600">+{file.additions}</span>
                            {' '}
                            <span className="text-red-600">-{file.deletions}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Deployment Status</h3>
                    <p className="text-sm text-gray-500">Production deployment information</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Deployment Info</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Environment:</dt>
                        <dd className="text-sm text-gray-900 capitalize">{deploymentStatus?.environment}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Status:</dt>
                        <dd className="text-sm text-gray-900 capitalize">{deploymentStatus?.status}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Deployed At:</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(deploymentStatus?.deployedAt).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Deployment Logs</h4>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                      {deploymentStatus?.logs.map((log, index) => (
                        <div key={index} className="text-green-400 mb-1">
                          $ {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <button
                        onClick={handleMergePR}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Merge PR
                      </button>
                      <button
                        onClick={handleRollback}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Rollback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeploymentReview; 