// Import required modules
const express = require('express');
const app = express();
const axios = require('axios')
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Simulated external API URL for searching books
const externalApiUrl = 'https://www.googleapis.com/books/v1/volumes'; // Example external API


// Sample book list
const books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 10.99, isbn: '9780743273565', reviews: [
        { comment: 'A timeless classic!' },
        { comment: 'Beautifully written.' }
    ] },
    { id: 2, title: '1984', author: 'George Orwell', price: 8.99, isbn: '9780451524935', reviews: [
        {comment: 'Disturbingly relevant.' },
        {comment: 'A must-read for everyone.' }
    ]},
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 12.99, isbn: '9780061120084',
        reviews: [
            { comment: 'Heartbreaking and inspiring.' },
            { comment: 'An American classic.' }
        ]
     },
    { id: 4, title: 'Animal Farm', author: 'George Orwell', price: 7.99, isbn: '9780451526342',
        reviews: [
            { comment: 'Good.' },
            { comment: 'Its nice but who loves animals for those only.' }
        ]
     },
    { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 9.99, isbn: '9780316769488',
        reviews: [
            { comment: 'Nice thought behind the book.' },
            { comment: 'An classic.' }
        ]
     },
];

const users = [];
// Route to fetch the book list
app.get('/books', (req, res) => {
    res.json({
        success: true,
        message: "Available books in the shop",
        data: books,
    });
});

// Route to fetch a book by ISBN
app.get('/books/:isbn', (req, res) => {
    const { isbn } = req.params;

    // Find the book with the matching ISBN
    const book = books.find((b) => b.isbn === isbn);

    if (book) {
        res.json({
            success: true,
            message: `Book with ISBN ${isbn} found`,
            data: book,
        });
    } else {
        res.status(404).json({
            success: false,
            message: `No book found with ISBN ${isbn}`,
        });
    }
});


// Route to fetch books by author
app.get('/books/author/:author', (req, res) => {
    const { author } = req.params;

    // Filter books by the specified author (case-insensitive)
    const booksByAuthor = books.filter((b) => b.author.toLowerCase() === author.toLowerCase());

    if (booksByAuthor.length > 0) {
        res.json({
            success: true,
            message: `Books by author ${author}`,
            data: booksByAuthor,
        });
    } else {
        res.status(404).json({
            success: false,
            message: `No books found by author ${author}`,
        });
    }
});


// Route to fetch books by title
app.get('/books/title/:title', (req, res) => {
    const { title } = req.params;

    // Filter books by the specified title (case-insensitive)
    const booksByTitle = books.filter((b) => b.title.toLowerCase().includes(title.toLowerCase()));

    if (booksByTitle.length > 0) {
        res.json({
            success: true,
            message: `Books with title matching "${title}"`,
            data: booksByTitle,
        });
    } else {
        res.status(404).json({
            success: false,
            message: `No books found with title "${title}"`,
        });
    }
});

// Route to fetch book reviews by ID
app.get('/books/:id/reviews', (req, res) => {
    const { id } = req.params;

    // Find the book with the given ID
    const book = books.find((b) => b.id === parseInt(id));

    if (book) {
        res.json({
            success: true,
            message: `Reviews for book "${book.title}"`,
            data: book.reviews,
        });
    } else {
        res.status(404).json({
            success: false,
            message: `No book found with ID ${id}`,
        });
    }
});


// Route to register a new user
app.post('/users/register', (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required.',
        });
    }

    // Check if the email is already registered
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Email is already registered.',
        });
    }

    // Add the new user to the database
    const newUser = { id: users.length + 1, name, email, password };
    users.push(newUser);

    res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: newUser,
    });
});

// Route to login as a registered user
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.',
        });
    }

    // Check if the user exists and the password matches
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password.',
        });
    }
});


// Route to add or modify a book review
app.post('/books/:id/review', (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    // Basic validation
    if (!comment) {
        return res.status(400).json({
            success: false,
            message: 'comment are required.',
        });
    }

    // Find the book by ID
    const book = books.find((b) => b.id === parseInt(id));

    if (!book) {
        return res.status(404).json({
            success: false,
            message: `No book found with ID ${id}`,
        });
    }

    // Check if the reviewer already has a review for this book
    const existingReview = book.reviews.find((review) => review.comment.toLowerCase() === comment.toLowerCase());

    if (existingReview) {
        existingReview.comment = comment;
        res.json({
            success: true,
            message: `Review updated for book "${book.title}"`,
            data: book,
        });
    } else {
        // Add a new review
        book.reviews.push({ comment });
        res.status(201).json({
            success: true,
            message: `Review added for book "${book.title}"`,
            data: book,
        });
    }
});

// Route to delete a review by comment
app.delete('/books/:id/review', (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    // Basic validation
    if (!comment) {
        return res.status(400).json({
            success: false,
            message: 'Comment is required to delete a review.',
        });
    }

    // Find the book by ID
    const book = books.find((b) => b.id === parseInt(id));

    if (!book) {
        return res.status(404).json({
            success: false,
            message: `No book found with ID ${id}`,
        });
    }

    // Find the review index by the comment text
    const reviewIndex = book.reviews.findIndex(
        (review) => review.comment.toLowerCase() === comment.toLowerCase()
    );

    if (reviewIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `No review found with the comment "${comment}" for book "${book.title}"`,
        });
    }

    // Remove the review from the reviews array
    book.reviews.splice(reviewIndex, 1);

    res.json({
        success: true,
        message: `Review with comment "${comment}" deleted for book "${book.title}"`,
        data: book,
    });
});


// Simulated asynchronous function to get all books
const getAllBooks = (callback) => {
    setTimeout(() => {
        callback(null, books); // Pass the books to the callback
    }, 1000); 
};

// Route to get all books
app.get('/allbooks', async (req, res) => {
    try {
        getAllBooks((error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching books',
                });
            }

            res.json({
                success: true,
                message: 'List of all books',
                data: result,
            });
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred',
        });
    }
});


// Function to search book by ISBN using a Promise
const searchBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        // Simulate a delay (e.g., database query)
        setTimeout(() => {
            const book = books.find((b) => b.isbn === isbn);
            if (book) {
                resolve(book); // Book found
            } else {
                reject(new Error('Book not found')); // Book not found
            }
        }, 1000); // 1-second delay to mimic database operation
    });
};

// Route to search for a book by ISBN
app.get('/getbooksbyisbn/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const book = await searchBookByISBN(isbn); // Await the Promise
        res.json({
            success: true,
            message: `Book found for ISBN ${isbn}`,
            data: book,
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            message: err.message,
        });
    }
});

// Route to search books by Author using Axios with Async/Await
app.get('/getbooksbyauthor/author/:author', async (req, res) => {
    const { author } = req.params;

    try {
        const response = await axios.get(externalApiUrl, {
            params: { q: `inauthor:${author}` }, // Search by author
        });

        const books = response.data.items || []; // Extract book items from the API response
        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No books found by author "${author}"`,
            });
        }

        res.json({
            success: true,
            message: `Books found by author "${author}"`,
            data: books.map((book) => ({
                title: book.volumeInfo.title,
                author: book.volumeInfo.authors.join(', '),
                isbn: book.volumeInfo.industryIdentifiers ? book.volumeInfo.industryIdentifiers[0].identifier : 'N/A',
            })),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching books from the external API.',
        });
    }
});


// Route to search books by Title using Axios with Async/Await
app.get('/getbooksbytitle/title/:title', async (req, res) => {
    const { title } = req.params;

    try {
        const response = await axios.get(externalApiUrl, {
            params: { q: `intitle:${title}` }, // Search by title
        });

        const books = response.data.items || []; // Extract book items from the API response
        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No books found with title "${title}"`,
            });
        }

        res.json({
            success: true,
            message: `Books found with title "${title}"`,
            data: books.map((book) => ({
                title: book.volumeInfo.title,
                author: book.volumeInfo.authors.join(', '),
                isbn: book.volumeInfo.industryIdentifiers ? book.volumeInfo.industryIdentifiers[0].identifier : 'N/A',
            })),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching books from the external API.',
        });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
