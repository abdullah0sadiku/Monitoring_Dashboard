const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Debug logging
  console.log('Auth Debug:', {
    method: req.method,
    url: req.url,
    authHeader: authHeader,
    hasToken: !!token,
    allHeaders: Object.keys(req.headers)
  });

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid authentication token' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Your session has expired. Please login again.' 
      });
    }

    // Verify user still exists in database
    const db = getDatabase();
    db.get('SELECT id, email, name FROM users WHERE email = ?', [user.email], (err, row) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Failed to verify user' 
        });
      }

      if (!row) {
        return res.status(403).json({ 
          error: 'User not found',
          message: 'User account no longer exists' 
        });
      }

      req.user = {
        id: row.id,
        email: row.email,
        name: row.name
      };
      next();
    });
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      return next();
    }

    const db = getDatabase();
    db.get('SELECT id, email, name FROM users WHERE email = ?', [user.email], (err, row) => {
      if (err || !row) {
        req.user = null;
      } else {
        req.user = {
          id: row.id,
          email: row.email,
          name: row.name
        };
      }
      next();
    });
  });
};

module.exports = {
  authenticateToken,
  optionalAuth
}; 