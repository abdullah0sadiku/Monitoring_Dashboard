import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AIService from '../services/aiService';
import { ERROR_MESSAGES } from '../utils/constants';

// Simplified error messages for non-technical users
const getErrorMessage = (scraperId) => {
  const errors = {
    '1': "The bank website changed their page layout, so our monitor can't find the transaction information anymore.",
    '2': "The online store website is loading too slowly or changed how they display prices.",
    '4': "The social media account requires a new login - the old login expired."
  };
  return errors[scraperId] || errors['1'];
};

function ScraperFixDetail({ scrapers, onAiFix, aiFix }) {
  const { scraperId } = useParams();
  const navigate = useNavigate();
  const scraper = scrapers.find(s => s.id === scraperId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMagic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AIService.generateFix(scraperId, {
        errorSummary: scraper.errorSummary,
        lastAction: scraper.lastAction,
        monitorType: scraper.name
      });
      
      if (result.success) {
        onAiFix(scraperId, result.data.code, result.data.explanation);
        navigate(`/review/${scraperId}`);
      } else {
        setError(result.error || 'Failed to generate fix');
      }
    } catch (err) {
      setError(ERROR_MESSAGES.aiServiceUnavailable);
    } finally {
      setLoading(false);
    }
  };

  if (!scraper) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="text-red-600 text-lg font-medium">Monitor not found.</div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/broken')} 
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Fix Monitor</h1>
                <p className="mt-1 text-sm text-gray-500">{scraper.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Requires Attention
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Issue Analysis</h3>
                  <p className="text-sm text-gray-500">Current problem with this monitor</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Problem Summary</h4>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {scraper.errorSummary}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Detailed Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {getErrorMessage(scraperId)}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Issue detected: {scraper.lastChecked}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Fix Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">AI-Powered Fix</h3>
                  <p className="text-sm text-gray-500">Automated problem resolution</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}
              
              {!loading ? (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to Fix This Issue
                    </h4>
                    <p className="text-sm text-gray-500 mb-6">
                      Our AI will analyze the problem and generate a solution automatically
                    </p>
                  </div>
                  <button
                    onClick={handleMagic}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    ✨ Generate AI Fix
                  </button>
                  <p className="text-xs text-gray-400 mt-3">
                    This process typically takes 2-3 seconds
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                    <h4 className="text-lg font-medium text-purple-600 mb-2">
                      AI Analysis in Progress
                    </h4>
                    <p className="text-sm text-gray-500">
                      Analyzing the issue and generating a solution...
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center text-sm text-purple-700">
                      <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                      Processing monitor configuration...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScraperFixDetail; 