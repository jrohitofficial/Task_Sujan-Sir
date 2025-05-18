const Book = require('../models/Book');

/**
 * Middleware for validating book data in requests
 */
const validateBookData = (req, res, next) => {
  const errors = Book.validate(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

/**
 * Middleware to validate book ID parameter
 */
const validateBookId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      error: true,
      message: 'Invalid book ID. Must be a number.'
    });
  }
  
  req.bookId = parseInt(id);
  next();
};

module.exports = {
  validateBookData,
  validateBookId
};
