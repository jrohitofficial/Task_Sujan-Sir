/**
 * Book Model
 * 
 * Defines the structure of a Book object
 */
class Book {
  constructor(bookId, name, author, price, publishedDate) {
    this.bookId = bookId;
    this.name = name;
    this.author = author;
    this.price = price;
    this.publishedDate = publishedDate;
  }

  // Static method to create a book from request body
  static fromRequestBody(body, bookId) {
    return new Book(
      bookId || body.bookId,
      body.name,
      body.author,
      body.price,
      body.publishedDate ? new Date(body.publishedDate) : new Date()
    );
  }

  // Validate book data
  static validate(bookData) {
    const errors = [];

    if (!bookData.name || typeof bookData.name !== 'string' || bookData.name.trim() === '') {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!bookData.author || typeof bookData.author !== 'string' || bookData.author.trim() === '') {
      errors.push('Author is required and must be a non-empty string');
    }

    if (bookData.price === undefined || isNaN(parseFloat(bookData.price)) || parseFloat(bookData.price) < 0) {
      errors.push('Price is required and must be a non-negative number');
    }

    if (bookData.publishedDate && isNaN(Date.parse(bookData.publishedDate))) {
      errors.push('Published date must be a valid date');
    }

    return errors;
  }
}

module.exports = Book;
