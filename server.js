const express = require('express');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/bookRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', bookRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Book Management API',
    endpoints: {
      getAllBooks: 'GET /api/books',
      getBookById: 'GET /api/books/:id',
      createBook: 'POST /api/books',
      updateBook: 'PUT /api/books/:id',
      deleteBook: 'DELETE /api/books/:id'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
