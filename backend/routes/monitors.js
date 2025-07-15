const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.js');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/javascript' || file.mimetype === 'application/javascript') {
      cb(null, true);
    } else {
      cb(new Error('Only JavaScript files are allowed'), false);
    }
  }
});

// Get all monitors for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      m.id,
      m.name,
      m.target_url,
      m.scraper_code,
      m.status,
      m.last_checked,
      m.last_action,
      m.created_by,
      m.created_at,
      m.updated_at,
      u.name as creator_name
    FROM monitors m
    LEFT JOIN users u ON m.created_by = u.email
    WHERE m.created_by = ?
    ORDER BY m.created_at DESC
  `, [req.user.email], (err, monitors) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch monitors' 
      });
    }

    res.json({ data: monitors });
  });
});

// Get monitor by ID
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const monitorId = req.params.id;

  db.get(`
    SELECT 
      m.id,
      m.name,
      m.target_url,
      m.scraper_code,
      m.status,
      m.last_checked,
      m.last_action,
      m.created_by,
      m.created_at,
      m.updated_at,
      u.name as creator_name
    FROM monitors m
    LEFT JOIN users u ON m.created_by = u.email
    WHERE m.id = ? AND m.created_by = ?
  `, [monitorId, req.user.email], (err, monitor) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch monitor' 
      });
    }

    if (!monitor) {
      return res.status(404).json({ 
        error: 'Monitor not found',
        message: 'Monitor does not exist or you do not have access to it' 
      });
    }

    res.json({ data: monitor });
  });
});

// Create new monitor
router.post('/', authenticateToken, upload.single('scraperCode'), [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('targetUrl').isURL()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { name, targetUrl } = req.body;
    const scraperCode = req.file ? req.file.path : null;
    const db = getDatabase();

    db.run(`
      INSERT INTO monitors (name, target_url, scraper_code, created_by)
      VALUES (?, ?, ?, ?)
    `, [name, targetUrl, scraperCode, req.user.email], function(err) {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Failed to create monitor' 
        });
      }

      res.status(201).json({
        message: 'Monitor created successfully',
        data: {
          id: this.lastID,
          name,
          target_url: targetUrl,
          scraper_code: scraperCode,
          status: 'Pending',
          created_by: req.user.email,
          created_at: new Date().toISOString()
        }
      });
    });
  } catch (error) {
    console.error('Create monitor error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to create monitor' 
    });
  }
});

// Update monitor
router.put('/:id', authenticateToken, upload.single('scraperCode'), [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('targetUrl').optional().isURL()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const monitorId = req.params.id;
    const { name, targetUrl } = req.body;
    const db = getDatabase();

    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (targetUrl) {
      updateFields.push('target_url = ?');
      updateValues.push(targetUrl);
    }

    if (req.file) {
      updateFields.push('scraper_code = ?');
      updateValues.push(req.file.path);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update',
        message: 'Please provide at least one field to update' 
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(monitorId, req.user.email);

    const query = `
      UPDATE monitors 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND created_by = ?
    `;

    db.run(query, updateValues, function(err) {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Failed to update monitor' 
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          error: 'Monitor not found',
          message: 'Monitor does not exist or you do not have access to it' 
        });
      }

      res.json({
        message: 'Monitor updated successfully'
      });
    });
  } catch (error) {
    console.error('Update monitor error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update monitor' 
    });
  }
});

// Delete monitor
router.delete('/:id', authenticateToken, (req, res) => {
  const monitorId = req.params.id;
  const db = getDatabase();

  db.run(`
    DELETE FROM monitors 
    WHERE id = ? AND created_by = ?
  `, [monitorId, req.user.email], function(err) {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to delete monitor' 
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ 
        error: 'Monitor not found',
        message: 'Monitor does not exist or you do not have access to it' 
      });
    }

    res.json({
      message: 'Monitor deleted successfully'
    });
  });
});

// Execute monitor
router.post('/:id/execute', authenticateToken, (req, res) => {
  const monitorId = req.params.id;
  const db = getDatabase();

  // Get monitor details
  db.get(`
    SELECT * FROM monitors 
    WHERE id = ? AND created_by = ?
  `, [monitorId, req.user.email], (err, monitor) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch monitor' 
      });
    }

    if (!monitor) {
      return res.status(404).json({ 
        error: 'Monitor not found',
        message: 'Monitor does not exist or you do not have access to it' 
      });
    }

    // Simulate execution (in real app, this would run the scraper)
    const executionStart = Date.now();
    const success = Math.random() > 0.3; // 70% success rate for demo
    const executionTime = Date.now() - executionStart;

    const newStatus = success ? 'Working' : 'Broken';
    const lastAction = success ? 'Executed successfully' : 'Execution failed';

    // Update monitor status
    db.run(`
      UPDATE monitors 
      SET status = ?, last_checked = CURRENT_TIMESTAMP, last_action = ?
      WHERE id = ?
    `, [newStatus, lastAction, monitorId], function(err) {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Failed to update monitor status' 
        });
      }

      // Log execution
      db.run(`
        INSERT INTO monitor_logs (monitor_id, status, message, execution_time)
        VALUES (?, ?, ?, ?)
      `, [monitorId, newStatus, lastAction, executionTime]);

      res.json({
        message: `Monitor executed: ${lastAction}`,
        data: {
          id: monitorId,
          status: newStatus,
          last_checked: new Date().toISOString(),
          last_action: lastAction,
          execution_time: executionTime
        }
      });
    });
  });
});

// Get monitor logs
router.get('/:id/logs', authenticateToken, (req, res) => {
  const monitorId = req.params.id;
  const db = getDatabase();

  db.all(`
    SELECT * FROM monitor_logs 
    WHERE monitor_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `, [monitorId], (err, logs) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch monitor logs' 
      });
    }

    res.json({ data: logs });
  });
});

// Get broken monitors
router.get('/status/broken', authenticateToken, (req, res) => {
  const db = getDatabase();

  db.all(`
    SELECT 
      m.id,
      m.name,
      m.target_url,
      m.status,
      m.last_checked,
      m.last_action,
      m.created_at
    FROM monitors m
    WHERE m.created_by = ? AND m.status = 'Broken'
    ORDER BY m.last_checked DESC
  `, [req.user.email], (err, monitors) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch broken monitors' 
      });
    }

    res.json({ data: monitors });
  });
});

// Get monitor statistics
router.get('/stats/overview', authenticateToken, (req, res) => {
  const db = getDatabase();

  db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Working' THEN 1 ELSE 0 END) as working,
      SUM(CASE WHEN status = 'Broken' THEN 1 ELSE 0 END) as broken,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
    FROM monitors 
    WHERE created_by = ?
  `, [req.user.email], (err, stats) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch statistics' 
      });
    }

    res.json({ data: stats });
  });
});

module.exports = router; 