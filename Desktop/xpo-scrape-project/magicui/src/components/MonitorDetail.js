import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function MonitorDetail({ scrapers, user, onLogout }) {
  const { monitorId } = useParams();
  const navigate = useNavigate();
  const scraper = scrapers.find(s => s.id === monitorId);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!scraper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Monitor Not Found</h2>
          <p className="text-gray-600 mb-6">The requested monitor could not be found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Return to Dashboard
          </button>
        </div>
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
                onClick={() => navigate('/dashboard')} 
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{scraper.name}</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor details and status</p>
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
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                scraper.status === 'Working'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {scraper.status === 'Working' ? 'Operational' : 'Needs Attention'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monitor Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Monitor Information</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Monitor Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{scraper.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        scraper.status === 'Working'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {scraper.status === 'Working' ? 'Operational' : 'Needs Attention'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Check</dt>
                    <dd className="mt-1 text-sm text-gray-900">{scraper.lastChecked}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Monitor ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{scraper.id}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Last Action</dt>
                    <dd className="mt-1 text-sm text-gray-900">{scraper.lastAction}</dd>
                  </div>
                  {scraper.errorSummary && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Error Summary</dt>
                      <dd className="mt-1 text-sm text-red-600">{scraper.errorSummary}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                {scraper.status === 'Broken' ? (
                  <>
                    <button
                      onClick={() => navigate(`/fix/${scraper.id}`)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Fix Monitor
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Use AI-powered analysis to automatically fix this monitor
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">Monitor is working correctly</p>
                    </div>
                  </>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonitorDetail; 