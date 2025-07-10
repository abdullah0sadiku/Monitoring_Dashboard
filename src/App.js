import React, { useState } from 'react';
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
import RepositoryConfig from './components/RepositoryConfig';
import './App.css';

// Mock data for testing - using non-technical language
const mockScrapers = [
  {
    id: '1',
    name: 'Bank Account Monitor',
    status: 'Broken',
    lastChecked: '2024-01-15 14:30',
    lastAction: 'Website layout changed - can\'t find transaction table',
    errorSummary: 'Bank website updated their page design'
  },
  {
    id: '2',
    name: 'Online Store Price Tracker',
    status: 'Broken',
    lastChecked: '2024-01-15 13:45',
    lastAction: 'Page takes too long to load - timeout error',
    errorSummary: 'Store website is loading slowly or changed structure'
  },
  {
    id: '3',
    name: 'News Article Collector',
    status: 'Working',
    lastChecked: '2024-01-15 12:20',
    lastAction: 'Successfully collected 15 articles'
  },
  {
    id: '4',
    name: 'Social Media Monitor',
    status: 'Broken',
    lastChecked: '2024-01-15 11:15',
    lastAction: 'Access denied - need to renew login',
    errorSummary: 'Login credentials expired or changed'
  },
  {
    id: '5',
    name: 'Weather Data Collector',
    status: 'Working',
    lastChecked: '2024-01-15 10:30',
    lastAction: 'Collected weather data for 5 cities'
  }
];

function App() {
  const [scrapers, setScrapers] = useState(mockScrapers);
  const [aiFixes, setAiFixes] = useState({});
  const [prLinks, setPrLinks] = useState({});
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
                <Dashboard scrapers={scrapers} user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/broken" 
            element={
              <ProtectedRoute>
                <BrokenScrapersList scrapers={scrapers} user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/monitor/:monitorId" 
            element={
              <ProtectedRoute>
                <MonitorDetail scrapers={scrapers} user={user} onLogout={handleLogout} />
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
                <MonitorForm user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/monitors/edit/:monitorId" 
            element={
              <ProtectedRoute>
                <MonitorForm user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Repository Configuration Routes */}
          <Route 
            path="/repositories/add" 
            element={
              <ProtectedRoute>
                <RepositoryConfig user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/repositories/edit/:repoId" 
            element={
              <ProtectedRoute>
                <RepositoryConfig user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
