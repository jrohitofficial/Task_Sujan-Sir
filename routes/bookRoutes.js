const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { validateBookData, validateBookId } = require('../middleware/validation');

/**
 * Book routes
 * 
 * Defines API endpoints for book CRUD operations
 */

// GET all books
router.get('/books', bookController.getAllBooks);

// GET a single book by ID
router.get('/books/:id', validateBookId, bookController.getBookById);

// POST create a new book
router.post('/books', validateBookData, bookController.createBook);

// PUT update a book
router.put('/books/:id', validateBookId, validateBookData, bookController.updateBook);

// DELETE a book
router.delete('/books/:id', validateBookId, bookController.deleteBook);

module.exports = router;
