const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating a Monitor
const validateMonitor = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string'),
  body('targetUrl')
    .notEmpty().withMessage('Target URL is required')
    .isURL().withMessage('Target URL must be a valid URL'),
  body('monitorType')
    .optional()
    .isIn(['web_scraping', 'api_monitoring', 'price_tracking', 'content_monitoring'])
    .withMessage('Invalid monitor type'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'broken', 'maintenance'])
    .withMessage('Invalid status'),
  body('frequency')
    .optional()
    .isInt({ min: 1 }).withMessage('Frequency must be a positive integer'),
  body('selectors')
    .optional()
    .isObject().withMessage('Selectors must be an object'),
  body('createdBy')
    .notEmpty().withMessage('createdBy is required')
    .isString().withMessage('createdBy must be a string'),
  // Add more validation as needed for other fields
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateMonitor }; 