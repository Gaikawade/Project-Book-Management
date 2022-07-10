const express = require('express');
const router = express.Router();
const {authenticate} = require("../middleware/auth");
const {createUser, loginUser} = require("../controllers/userController");
const {createBook, getBooks, getBookById, updateBook, deleteById} = require("../controllers/bookController");
const {createReview, updateReview, deleteReview} = require("../controllers/reviewController");('../controllers/reviewController');


//User APIs
router.post("/register", createUser);       //createUser
router.post("/login", loginUser);           //logInUser

//Book APIs
router.post("/books", authenticate, createBook);            //createBook
router.get("/books", authenticate, getBooks);               //getBook
router.get("/books/:bookId", authenticate, getBookById);    //getBookById
router.put('/books/:bookId', authenticate, updateBook);     //updateBook
router.delete('/books/:bookId', authenticate, deleteById);  //deleteBookById

//Review APIs
router.post('/books/:bookId/review', createReview);             //createReview
router.put('/books/:bookId/review/:reviewId', updateReview);    //updateReview
router.delete('/books/:bookId/review/:reviewId', deleteReview); //deleteReview

module.exports = router;