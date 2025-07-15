const express = require('express');
const OpenAI = require('openai');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze and fix scraper code
router.post('/analyze', authenticateToken, [
  body('monitorId').isInt(),
  body('originalCode').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { monitorId, originalCode } = req.body;
    const db = getDatabase();

    // Verify monitor belongs to user
    db.get(`
      SELECT * FROM monitors 
      WHERE id = ? AND created_by = ?
    `, [monitorId, req.user.email], async (err, monitor) => {
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

      try {
        // Create AI analysis prompt
        const prompt = `
You are an expert web scraping developer. Analyze the following JavaScript scraper code and provide a fixed version if there are any issues.

Original Code:
${originalCode}

Target URL: ${monitor.target_url}

Please analyze the code and provide:
1. A fixed version of the code if there are issues
2. A brief explanation of what was wrong and how you fixed it
3. If the code looks correct, confirm it's working properly

Respond in JSON format:
{
  "fixedCode": "the fixed JavaScript code",
  "explanation": "explanation of changes made",
  "status": "fixed" or "working"
}
`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert JavaScript web scraping developer. Always respond with valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });

        const aiResponse = completion.choices[0].message.content;
        let parsedResponse;

        try {
          // Try to parse the response as JSON
          parsedResponse = JSON.parse(aiResponse);
        } catch (parseError) {
          // If parsing fails, create a structured response
          parsedResponse = {
            fixedCode: aiResponse,
            explanation: "AI provided code analysis",
            status: "analyzed"
          };
        }

        // Save AI fix to database
        db.run(`
          INSERT INTO ai_fixes (monitor_id, original_code, fixed_code, explanation, status)
          VALUES (?, ?, ?, ?, ?)
        `, [
          monitorId, 
          originalCode, 
          parsedResponse.fixedCode, 
          parsedResponse.explanation, 
          parsedResponse.status
        ], function(err) {
          if (err) {
            return res.status(500).json({ 
              error: 'Database error',
              message: 'Failed to save AI analysis' 
            });
          }

          res.json({
            message: 'AI analysis completed',
            data: {
              id: this.lastID,
              monitorId,
              originalCode,
              fixedCode: parsedResponse.fixedCode,
              explanation: parsedResponse.explanation,
              status: parsedResponse.status,
              createdAt: new Date().toISOString()
            }
          });
        });

      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        res.status(500).json({ 
          error: 'AI service error',
          message: 'Failed to analyze code with AI service' 
        });
      }
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to analyze code' 
    });
  }
});

// Get AI fixes for a monitor
router.get('/fixes/:monitorId', authenticateToken, (req, res) => {
  const monitorId = req.params.monitorId;
  const db = getDatabase();

  // Verify monitor belongs to user
  db.get(`
    SELECT id FROM monitors 
    WHERE id = ? AND created_by = ?
  `, [monitorId, req.user.email], (err, monitor) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to verify monitor access' 
      });
    }

    if (!monitor) {
      return res.status(404).json({ 
        error: 'Monitor not found',
        message: 'Monitor does not exist or you do not have access to it' 
      });
    }

    // Get AI fixes
    db.all(`
      SELECT * FROM ai_fixes 
      WHERE monitor_id = ? 
      ORDER BY created_at DESC
    `, [monitorId], (err, fixes) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Failed to fetch AI fixes' 
        });
      }

      res.json({ data: fixes });
    });
  });
});

// Apply AI fix to monitor
router.post('/apply-fix/:fixId', authenticateToken, (req, res) => {
  const fixId = req.params.fixId;
  const db = getDatabase();

  // Get AI fix and verify access
  db.get(`
    SELECT af.*, m.created_by 
    FROM ai_fixes af
    JOIN monitors m ON af.monitor_id = m.id
    WHERE af.id = ?
  `, [fixId], (err, fix) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch AI fix' 
      });
    }

    if (!fix) {
      return res.status(404).json({ 
        error: 'AI fix not found',
        message: 'AI fix does not exist' 
      });
    }

    if (fix.created_by !== req.user.email) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have access to this AI fix' 
      });
    }

    // Update monitor with fixed code
    db.run(`
      UPDATE monitors 
      SET scraper_code = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [fix.fixed_code, fix.monitor_id], function(err) {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Failed to apply AI fix' 
        });
      }

      // Update AI fix status
      db.run(`
        UPDATE ai_fixes 
        SET status = 'Applied' 
        WHERE id = ?
      `, [fixId]);

      res.json({
        message: 'AI fix applied successfully',
        data: {
          monitorId: fix.monitor_id,
          fixId: fixId,
          appliedAt: new Date().toISOString()
        }
      });
    });
  });
});

// Test URL accessibility
router.post('/test-url', authenticateToken, [
  body('url').isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { url } = req.body;

    // Create AI prompt to test URL
    const prompt = `
Test the accessibility of this URL: ${url}

Please analyze if this URL is accessible and provide:
1. Whether the URL is accessible
2. Any potential issues that might affect web scraping
3. Recommendations for scraping this URL

Respond in JSON format:
{
  "accessible": true/false,
  "issues": ["list of potential issues"],
  "recommendations": ["list of recommendations"]
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert web scraping developer. Analyze URL accessibility and provide recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const aiResponse = completion.choices[0].message.content;
      let parsedResponse;

      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        parsedResponse = {
          accessible: true,
          issues: ["Unable to parse AI response"],
          recommendations: ["Check URL manually"]
        };
      }

      res.json({
        message: 'URL analysis completed',
        data: parsedResponse
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      res.status(500).json({ 
        error: 'AI service error',
        message: 'Failed to analyze URL with AI service' 
      });
    }

  } catch (error) {
    console.error('URL test error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to test URL' 
    });
  }
});

module.exports = router; 