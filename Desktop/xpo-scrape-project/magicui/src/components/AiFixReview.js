import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function AiFixReview({ scrapers, aiFix, onAccept, prLinks, user, onLogout }) {
  const { scraperId } = useParams();
  const navigate = useNavigate();
  const scraper = scrapers.find(s => s.id === scraperId);
  const fix = aiFix[scraperId] || {};
  const [loading, setLoading] = useState(false);

  // Mock old code based on scraper type
  const getOldCode = () => {
    const codeExamples = {
      '1': `import selenium.webdriver as webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://ourteam.github.io/bank-demo-v2/")

# OLD CODE - This is broken
transactions_table = driver.find_element(By.ID, "transactionsTable")
rows = transactions_table.find_elements(By.TAG_NAME, "tr")

for row in rows[1:]:  # Skip header
    cells = row.find_elements(By.TAG_NAME, "td")
    amount = cells[2].text  # OLD: Wrong column index
    date = cells[1].text
    description = cells[0].text
    
    print(f"Date: {date}, Amount: {amount}, Description: {description}")

driver.quit()`,
      '2': `import requests
from bs4 import BeautifulSoup

url = "https://example-store.com/products"

# OLD CODE - No timeout handling
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# OLD: Wrong selector
price_element = soup.select_one('.price .value')
if price_element:
    price = price_element.text.strip()
    print(f"Price: {price}")`,
      '4': `import tweepy

# OLD CODE - No rate limiting
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth)

# OLD: No error handling
tweets = api.user_timeline(screen_name="example_user", count=100)
for tweet in tweets:
    print(tweet.text)`,
      default: `# OLD CODE - Generic example
import requests
from bs4 import BeautifulSoup

def scrape_data(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # OLD: Basic extraction without error handling
    data = soup.find('div', class_='content')
    return data.text if data else None`
    };
    
    return codeExamples[scraperId] || codeExamples.default;
  };

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate PR creation
      const prUrl = `https://github.com/your-repo/pull/${Math.floor(Math.random() * 1000 + 100)}`;
      onAccept(scraperId, prUrl);
      setLoading(false);
      navigate(`/confirmation/${scraperId}`);
    }, 2500);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!scraper) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="text-red-600 text-lg font-medium">Monitor not found.</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  const oldCode = getOldCode();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(`/fix/${scraperId}`)} 
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Review AI Solution</h1>
                <p className="mt-1 text-sm text-gray-500">{scraper.name}</p>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Solution Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* AI Solution Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">AI Analysis & Solution</h3>
                  <p className="text-sm text-gray-500">What our AI discovered and how it will fix the issue</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Solution Summary</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {fix.explanation || 'Our AI analyzed the problem and created a solution to fix your monitor.'}
                </p>
              </div>
            </div>
          </div>

          {/* Code Comparison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Code Comparison</h3>
                  <p className="text-sm text-gray-500">Compare the old broken code with the new fixed code</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Old Code Container */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Old Code (Broken)
                    </h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Issues Found
                    </span>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>{oldCode}</code>
                    </pre>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-red-900 mb-1">Issues Identified:</h5>
                    <ul className="text-xs text-red-800 space-y-1">
                      <li>• Outdated selectors and element IDs</li>
                      <li>• Missing error handling and timeouts</li>
                      <li>• Incorrect data extraction logic</li>
                      <li>• No retry mechanisms for failures</li>
                    </ul>
                  </div>
                </div>

                {/* New Code Container */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      New Code (Fixed)
                    </h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      AI Generated
                    </span>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>{fix.code || `# NEW CODE - AI Generated Fix
import selenium.webdriver as webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()
driver.get("https://ourteam.github.io/bank-demo-v2/")

# NEW: Updated selectors and error handling
try:
    # FIX: Updated selector for new page structure
    transactions_table = driver.find_element(By.ID, "bankTransactions")
    rows = transactions_table.find_elements(By.TAG_NAME, "tr")
    
    for row in rows[1:]:  # Skip header
        cells = row.find_elements(By.TAG_NAME, "td")
        # FIX: Updated column mapping
        amount = cells[3].text  # NEW: Correct column index
        date = cells[1].text
        description = cells[0].text
        
        print(f"Date: {date}, Amount: {amount}, Description: {description}")
        
except Exception as e:
    print(f"Error: {e}")
finally:
    driver.quit()`}</code>
                    </pre>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-green-900 mb-1">Improvements Made:</h5>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• Updated selectors to match new page structure</li>
                      <li>• Added comprehensive error handling</li>
                      <li>• Implemented retry logic and timeouts</li>
                      <li>• Fixed data extraction and column mapping</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Status */}
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
                  <h3 className="text-lg font-medium text-gray-900">Ready for Deployment</h3>
                  <p className="text-sm text-gray-500">The solution has been validated and is ready to apply</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-900">Validation Complete</h4>
                    <p className="text-sm text-green-800 mt-1">
                      The fix has been tested and validated. Applying this solution will restore your monitor to normal operation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Safety Check</div>
                  <div className="text-xs text-green-600 mt-1">✓ Passed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Compatibility</div>
                  <div className="text-xs text-green-600 mt-1">✓ Verified</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Impact</div>
                  <div className="text-xs text-green-600 mt-1">✓ Low Risk</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deploy Solution</h3>
              <p className="text-sm text-gray-500">
                Choose whether to apply this fix to your monitor
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAccept}
                disabled={loading}
                className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Deploying Solution...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Deploy & Fix Monitor
                  </>
                )}
              </button>
              
              <button
                onClick={() => navigate('/broken')}
                disabled={loading}
                className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiFixReview; 