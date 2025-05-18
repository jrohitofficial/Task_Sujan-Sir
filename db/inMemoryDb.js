/**
 * In-memory database implementation
 * 
 * Stores and manages books in a JavaScript array
 */
class InMemoryDB {
  constructor() {
    this.books = [];
    this.lastId = 0;
    
    // Initialize with a few books
    this.addBook({
      name: "JavaScript: The Good Parts",
      author: "Douglas Crockford",
      price: 29.99,
      publishedDate: "2008-05-01"
    });
    
    this.addBook({
      name: "Clean Code",
      author: "Robert C. Martin",
      price: 39.99,
      publishedDate: "2008-08-01"
    });
  }

  // Generate a new unique ID
  generateId() {
    return ++this.lastId;
  }

  // Get all books
  getAllBooks() {
    return this.books;
  }

  // Get a book by ID
  getBookById(id) {
    return this.books.find(book => book.bookId === parseInt(id));
  }

  // Add a new book
  addBook(bookData) {
    // Generate a new ID for the book
    const newBookId = this.generateId();
    
    // Create a new book object with the generated ID
    const newBook = {
      bookId: newBookId,
      name: bookData.name,
      author: bookData.author,
      price: parseFloat(bookData.price),
      publishedDate: bookData.publishedDate ? new Date(bookData.publishedDate) : new Date()
    };
    
    // Add the book to the in-memory array
    this.books.push(newBook);
    
    return newBook;
  }

  // Update an existing book
  updateBook(id, bookData) {
    const index = this.books.findIndex(book => book.bookId === parseInt(id));
    
    if (index === -1) {
      return null;
    }
    
    // Update the book with new data
    this.books[index] = {
      ...this.books[index],
      name: bookData.name || this.books[index].name,
      author: bookData.author || this.books[index].author,
      price: bookData.price !== undefined ? parseFloat(bookData.price) : this.books[index].price,
      publishedDate: bookData.publishedDate ? new Date(bookData.publishedDate) : this.books[index].publishedDate
    };
    
    return this.books[index];
  }

  // Delete a book
  deleteBook(id) {
    const index = this.books.findIndex(book => book.bookId === parseInt(id));
    
    if (index === -1) {
      return false;
    }
    
    this.books.splice(index, 1);
    return true;
  }
}

// Create and export a singleton instance
const db = new InMemoryDB();
module.exports = db;
