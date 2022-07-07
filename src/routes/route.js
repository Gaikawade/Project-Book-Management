const express = require('express');
const router = express.Router();
const {createUser, loginUser} = require("../controllers/userController");
const {createBook, getBooks, getBookById, updateBook, deleteById} = require("../controllers/bookController");
const {authenticate} = require("../middleware/auth");

//User API
router.post("/register", createUser);       //createUser
router.post("/login", loginUser);           //logInUser

//Book's API
router.post("/books", authenticate, createBook);
router.get("/books", authenticate, getBooks);
router.get("/books/:bookId", authenticate, getBookById);
router.put('/books/:bookId', authenticate, updateBook);
router.delete('/books/:bookId', authenticate, deleteById);

module.exports = router;