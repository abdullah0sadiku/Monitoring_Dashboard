import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BrokenScrapersList from './components/BrokenScrapersList';
import ScraperFixDetail from './components/ScraperFixDetail';
import AiFixReview from './components/AiFixReview';
import Confirmation from './components/Confirmation';
import MonitorDetail from './components/MonitorDetail';
import DeploymentReview from './components/DeploymentReview';
import MonitorForm from './components/MonitorForm';
import Analytics from './components/Analytics';
import apiService from './services/apiService';
import './App.css';

function App() {
  const [scrapers, setScrapers] = useState([]);
  const [aiFixes, setAiFixes] = useState({});
  const [prLinks, setPrLinks] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication and load monitors from backend on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedUser && savedToken) {
        try {
          console.log('🔄 Restoring session with token:', savedToken.substring(0, 20) + '...');
          
          // Set the token in the API service
          apiService.setToken(savedToken);
          
          // Verify the token is still valid by making a test request
          await apiService.healthCheck();
          
          // If successful, set the user
          setUser(JSON.parse(savedUser));
          console.log('✅ Session restored successfully');
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
        }
      } else {
        console.log('ℹ️ No saved session found');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Load monitors when user is authenticated
  useEffect(() => {
    if (user) {
      loadMonitors();
    }
  }, [user]);

  const loadMonitors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllMonitors();
      setScrapers(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load monitors:', err);
      setError('Failed to load monitors. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiService.setToken(null);
    
    setUser(null);
    setScrapers([]);
  };

  const handleAddMonitor = async (formData) => {
    try {
      // Add createdBy to the FormData
      formData.append('createdBy', user?.email || 'system');

      const response = await apiService.createMonitor(formData);
      
      // Reload monitors to get the updated list
      await loadMonitors();
      
      return response;
    } catch (error) {
      console.error('Failed to create monitor:', error);
      throw error;
    }
  };

  const handleExecuteMonitor = async (monitorId) => {
    try {
      const response = await apiService.executeMonitor(monitorId);
      
      // Reload monitors to get updated status
      await loadMonitors();
      
      return response;
    } catch (error) {
      console.error('Failed to execute monitor:', error);
      throw error;
    }
  };

  const handleDeleteMonitor = async (monitorId) => {
    try {
      await apiService.deleteMonitor(monitorId);
      
      // Reload monitors to get updated list
      await loadMonitors();
    } catch (error) {
      console.error('Failed to delete monitor:', error);
      throw error;
    }
  };

  const handleAiFix = (scraperId, code, explanation) => {
    setAiFixes(prev => ({
      ...prev,
      [scraperId]: { code, explanation }
    }));
  };

  const handleAccept = (scraperId, prUrl) => {
    setPrLinks(prev => ({
      ...prev,
      [scraperId]: prUrl
    }));
    
    // Update scraper status to working
    setScrapers(prev => prev.map(scraper => 
      scraper.id === scraperId 
        ? { ...scraper, status: 'Working', lastAction: 'Fixed automatically', lastChecked: new Date().toLocaleString() }
        : scraper
    ));
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-red-800">Error Loading Monitors</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadMonitors}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard 
                  scrapers={scrapers} 
                  user={user} 
                  onLogout={handleLogout}
                  onExecuteMonitor={handleExecuteMonitor}
                  onDeleteMonitor={handleDeleteMonitor}
                  onRefresh={loadMonitors}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/broken" 
            element={
              <ProtectedRoute>
                <BrokenScrapersList 
                  scrapers={scrapers} 
                  user={user} 
                  onLogout={handleLogout}
                  onExecuteMonitor={handleExecuteMonitor}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/monitor/:monitorId" 
            element={
              <ProtectedRoute>
                <MonitorDetail 
                  scrapers={scrapers} 
                  user={user} 
                  onLogout={handleLogout}
                  onExecuteMonitor={handleExecuteMonitor}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fix/:scraperId" 
            element={
              <ProtectedRoute>
                <ScraperFixDetail 
                  scrapers={scrapers} 
                  onAiFix={handleAiFix}
                  aiFix={aiFixes}
                  user={user}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/review/:scraperId" 
            element={
              <ProtectedRoute>
                <AiFixReview 
                  scrapers={scrapers} 
                  aiFix={aiFixes}
                  onAccept={handleAccept}
                  prLinks={prLinks}
                  user={user}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/confirmation/:scraperId" 
            element={
              <ProtectedRoute>
                <Confirmation 
                  scrapers={scrapers} 
                  prLinks={prLinks}
                  user={user}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/deployment/:scraperId" 
            element={
              <ProtectedRoute>
                <DeploymentReview 
                  scrapers={scrapers} 
                  prLinks={prLinks}
                  user={user}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Monitor Management Routes */}
          <Route 
            path="/monitors/add" 
            element={
              <ProtectedRoute>
                <MonitorForm 
                  user={user} 
                  onLogout={handleLogout} 
                  onAddMonitor={handleAddMonitor} 
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Analytics Route */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
