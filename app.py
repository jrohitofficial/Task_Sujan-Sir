import os
from datetime import datetime
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy

# Create the Flask app
app = Flask(__name__)

# Configure SQLAlchemy to use SQLite in-memory database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Book model
class Book(db.Model):
    bookId = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    publishedDate = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'bookId': self.bookId,
            'name': self.name,
            'author': self.author,
            'price': self.price,
            'publishedDate': self.publishedDate.isoformat()
        }

# Validation function
def validate_book_data(data):
    errors = []
    
    if not data.get('name') or not isinstance(data.get('name'), str) or data.get('name').strip() == '':
        errors.append('Name is required and must be a non-empty string')
    
    if not data.get('author') or not isinstance(data.get('author'), str) or data.get('author').strip() == '':
        errors.append('Author is required and must be a non-empty string')
    
    try:
        if data.get('price') is None or float(data.get('price')) < 0:
            errors.append('Price is required and must be a non-negative number')
    except (ValueError, TypeError):
        errors.append('Price must be a valid number')
    
    return errors

# Create all database tables and add sample data
with app.app_context():
    db.create_all()
    
    # Add sample data if the table is empty
    if not Book.query.first():
        sample_books = [
            Book(name="JavaScript: The Good Parts", author="Douglas Crockford", price=29.99, 
                 publishedDate=datetime(2008, 5, 1)),
            Book(name="Clean Code", author="Robert C. Martin", price=39.99, 
                 publishedDate=datetime(2008, 8, 1))
        ]
        db.session.add_all(sample_books)
        db.session.commit()

# Web Interface Routes
@app.route('/')
def home():
    books = Book.query.all()
    return render_template('index.html', books=books)

@app.route('/books/add', methods=['GET'])
def add_book_form():
    return render_template('add_book.html')

@app.route('/books/add', methods=['POST'])
def add_book():
    data = {
        'name': request.form.get('name'),
        'author': request.form.get('author'),
        'price': request.form.get('price'),
        'publishedDate': request.form.get('publishedDate')
    }
    
    errors = validate_book_data(data)
    if errors:
        for error in errors:
            flash(error, 'danger')
        return redirect(url_for('add_book_form'))
    
    new_book = Book(
        name=data['name'],
        author=data['author'],
        price=float(data['price']),
        publishedDate=datetime.fromisoformat(data['publishedDate']) if data['publishedDate'] else datetime.utcnow()
    )
    
    db.session.add(new_book)
    db.session.commit()
    
    flash('Book added successfully!', 'success')
    return redirect(url_for('home'))

@app.route('/books/<int:book_id>/edit', methods=['GET'])
def edit_book_form(book_id):
    book = Book.query.get_or_404(book_id)
    return render_template('edit_book.html', book=book)

@app.route('/books/<int:book_id>/edit', methods=['POST'])
def edit_book(book_id):
    book = Book.query.get_or_404(book_id)
    
    data = {
        'name': request.form.get('name'),
        'author': request.form.get('author'),
        'price': request.form.get('price'),
        'publishedDate': request.form.get('publishedDate')
    }
    
    errors = validate_book_data(data)
    if errors:
        for error in errors:
            flash(error, 'danger')
        return redirect(url_for('edit_book_form', book_id=book_id))
    
    book.name = data['name']
    book.author = data['author']
    book.price = float(data['price'])
    book.publishedDate = datetime.fromisoformat(data['publishedDate']) if data['publishedDate'] else book.publishedDate
    
    db.session.commit()
    
    flash('Book updated successfully!', 'success')
    return redirect(url_for('home'))

@app.route('/books/<int:book_id>/delete', methods=['POST'])
def delete_book_web(book_id):
    book = Book.query.get_or_404(book_id)
    
    db.session.delete(book)
    db.session.commit()
    
    flash('Book deleted successfully!', 'success')
    return redirect(url_for('home'))

# API Routes
@app.route('/api')
def api_index():
    return jsonify({
        'message': 'Book Management API',
        'endpoints': {
            'getAllBooks': 'GET /api/books',
            'getBookById': 'GET /api/books/<id>',
            'createBook': 'POST /api/books',
            'updateBook': 'PUT /api/books/<id>',
            'deleteBook': 'DELETE /api/books/<id>'
        }
    })

@app.route('/api/books', methods=['GET'])
def api_get_all_books():
    try:
        books = Book.query.all()
        return jsonify({
            'success': True,
            'count': len(books),
            'data': [book.to_dict() for book in books]
        }), 200
    except Exception as e:
        print(f"Error getting all books: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to retrieve books'
        }), 500

@app.route('/api/books/<int:id>', methods=['GET'])
def api_get_book_by_id(id):
    try:
        book = Book.query.get(id)
        if not book:
            return jsonify({
                'error': True,
                'message': f'Book with ID {id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': book.to_dict()
        }), 200
    except Exception as e:
        print(f"Error getting book by ID: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to retrieve book'
        }), 500

@app.route('/api/books', methods=['POST'])
def api_create_book():
    try:
        data = request.json
        errors = validate_book_data(data)
        
        if errors:
            return jsonify({
                'error': True,
                'message': 'Validation failed',
                'details': errors
            }), 400
        
        new_book = Book(
            name=data['name'],
            author=data['author'],
            price=float(data['price']),
            publishedDate=datetime.fromisoformat(data['publishedDate']) if data.get('publishedDate') else datetime.utcnow()
        )
        
        db.session.add(new_book)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Book created successfully',
            'data': new_book.to_dict()
        }), 201
    except Exception as e:
        print(f"Error creating book: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to create book'
        }), 500

@app.route('/api/books/<int:id>', methods=['PUT'])
def api_update_book(id):
    try:
        data = request.json
        book = Book.query.get(id)
        
        if not book:
            return jsonify({
                'error': True,
                'message': f'Book with ID {id} not found'
            }), 404
        
        errors = validate_book_data(data)
        if errors:
            return jsonify({
                'error': True,
                'message': 'Validation failed',
                'details': errors
            }), 400
        
        book.name = data['name']
        book.author = data['author']
        book.price = float(data['price'])
        if data.get('publishedDate'):
            book.publishedDate = datetime.fromisoformat(data['publishedDate'])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Book updated successfully',
            'data': book.to_dict()
        }), 200
    except Exception as e:
        print(f"Error updating book: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to update book'
        }), 500

@app.route('/api/books/<int:id>', methods=['DELETE'])
def api_delete_book(id):
    try:
        book = Book.query.get(id)
        
        if not book:
            return jsonify({
                'error': True,
                'message': f'Book with ID {id} not found'
            }), 404
        
        db.session.delete(book)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Book with ID {id} deleted successfully'
        }), 200
    except Exception as e:
        print(f"Error deleting book: {str(e)}")
        return jsonify({
            'error': True,
            'message': 'Failed to delete book'
        }), 500