const express = require('express');
const router = express.Router();
const {createUser, loginUser} = require("../controllers/userController");
const {createBook, getBooks, getBookById} = require("../controllers/bookController");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/books", createBook);
router.get("/books", getBooks);
router.get("/books/:bookId", getBookById);

module.exports = router;