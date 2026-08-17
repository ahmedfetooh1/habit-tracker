const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to evaluate validation rules and catch input errors.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
        message: 'Validation Error',
        errors: errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        })),
        });
    }
    next();
};

// Validation rules for User Registration
const validateRegister = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validate,
];

// Validation rules for User Login
const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
    ];

    // Validation rules for Habit Creation
    const validateCreateHabit = [
    body('title').trim().notEmpty().withMessage('Habit title is required'),
    body('frequency')
        .optional()
        .isIn(['daily', 'weekly'])
        .withMessage('Frequency must be daily or weekly'),
    body('targetDays')
        .optional()
        .isInt({ min: 1, max: 7 })
        .withMessage('Target days must be a number between 1 and 7'),
    validate,
];

// Validation rules for Habit Update
const validateUpdateHabit = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('frequency')
        .optional()
        .isIn(['daily', 'weekly'])
        .withMessage('Frequency must be daily or weekly'),
    body('targetDays')
        .optional()
        .isInt({ min: 1, max: 7 })
        .withMessage('Target days must be a number between 1 and 7'),
    validate,
];

// Validation rules for Logging Habit Progress
const validateLogHabit = [
    body('habitId').isMongoId().withMessage('Invalid Habit ID format'),
    body('date')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Date must be a valid ISO8601 date string'),
    body('completed').isBoolean().withMessage('Completed status must be a boolean'),
    validate,
    ];

    // Validation rule for MongoDB ObjectId parameters
    const validateMongoId = (paramName) => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
    validate,
    ];

    module.exports = {
    validateRegister,
    validateLogin,
    validateCreateHabit,
    validateUpdateHabit,
    validateLogHabit,
    validateMongoId,
};