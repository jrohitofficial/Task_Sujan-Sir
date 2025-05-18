const db = require('../db/inMemoryDb');
const Book = require('../models/Book');

/**
 * Book Controller
 * 
 * Contains methods for handling CRUD operations on books
 */
class BookController {
  /**
   * Get all books
   */
  getAllBooks(req, res) {
    try {
      const books = db.getAllBooks();
      
      res.status(200).json({
        success: true,
        count: books.length,
        data: books
      });
    } catch (error) {
      console.error('Error getting all books:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve books'
      });
    }
  }

  /**
   * Get a book by ID
   */
  getBookById(req, res) {
    try {
      const id = req.params.id;
      const book = db.getBookById(id);
      
      if (!book) {
        return res.status(404).json({
          error: true,
          message: `Book with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: book
      });
    } catch (error) {
      console.error('Error getting book by ID:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve book'
      });
    }
  }

  /**
   * Create a new book
   */
  createBook(req, res) {
    try {
      const newBook = db.addBook(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: newBook
      });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to create book'
      });
    }
  }

  /**
   * Update an existing book
   */
  updateBook(req, res) {
    try {
      const id = req.params.id;
      const updatedBook = db.updateBook(id, req.body);
      
      if (!updatedBook) {
        return res.status(404).json({
          error: true,
          message: `Book with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Book updated successfully',
        data: updatedBook
      });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to update book'
      });
    }
  }

  /**
   * Delete a book
   */
  deleteBook(req, res) {
    try {
      const id = req.params.id;
      const result = db.deleteBook(id);
      
      if (!result) {
        return res.status(404).json({
          error: true,
          message: `Book with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: `Book with ID ${id} deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to delete book'
      });
    }
  }
}

module.exports = new BookController();
