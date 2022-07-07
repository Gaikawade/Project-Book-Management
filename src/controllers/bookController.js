const mongoose = require("mongoose");
const moment = require("moment");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");

const createBook = async function (req, res) {
    try {
        let data = req.body;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({status: false, message: "please enter require data to create Book"});
        }

        let { title, excerpt, userId, ISBN, category, subcategory } = data;

        if (!title) {
            return res.status(400).send({ status: false, message: "please enter Book title" });
        }
        if (!excerpt) {
            return res.status(400).send({ status: false, message: "please enter excerpt" });
        }
        if (!userId) {
            return res.status(400).send({ status: false, message: "please enter userId" });
        }else if(userId !== req.userId){
            return res.status(403).send({status: false, message: 'Unauthorized access'});
        }
        if (!ISBN) {
            return res.status(400).send({ status: false, message: "please enter ISBIN" });
        }
        if (!category) {
            return res.status(400).send({ status: false, message: "please enter Book category" });
        }
        if (!subcategory) {
            return res.status(400).send({ status: false, message: "please enter subcategory" });
        }

        if (!/^[a-zA-Z0-9\s]+$/.test(title)) {
            return res.status(400).send({status: false, message: "Please Enter Only Alphabets in title"});
        }
        if (!/^[a-zA-Z\s]+$/.test(excerpt)) {
            return res.status(400).send({status: false, message: "Please Enter Only Alphabets in excerpt"});
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " invalid objectId" });
        }
        if(!/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN)){
            return res.status(400).send({ status: false, message: "Please Enter a valid ISBN number" });
        }
        if (!/^[a-zA-Z\s]+$/.test(category)) {
            return res.status(400).send({status: false, message: "Please Enter Only Alphabets in tittle"});
        }
        // if (!/^[a-zA-Z\s]+$/.test(subcategory)) {
        //     return res.status(400).send({status: false, message: "Please Enter Only Alphabets in subcategory",});
        // }

        let getTitle = await bookModel.findOne({title});
        if(getTitle){
            return res.status(400).send({status: false, message: "Title is already exists in our Data"})
        }
        let getISBN = await bookModel.findOne({ISBN});
        if(getISBN){
            return res.status(400).send({status: false, message: "ISBN is already exists in our Data"})
        }
        let getUserId = await userModel.findById({_id: userId});
        if(!getUserId){
            return res.status(400).send({status: false, message: "No user exists with the id exists"});
        }

        let date = Date.now();
        let dateFormat = moment(date).format('YYYY-MM-DD, hh:mm:ss')        //formatting date
        data['releasedAt'] = dateFormat;

        let savedData = await bookModel.create(data);
        return res.status(201).send({ status: true, message: "success", data: savedData });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const getBooks = async (req, res) => {
    try {
        let data = req.query;
        let {userId, category, subcategory} = data;
        let filter = {
            isDeleted: false,
            ...data
        };
        if(userId){
            if(!mongoose.isValidObjectId(userId)){
                res.status(400).send({status: false, message: "This is not a valid user id"});
            }
            let findById = await userModel.findOne({userId});
            if(!findById){
                res.status(404).send({status: false, message: "No user with this id exist"});
            }
        }
        if(category){
            let findByCategory = await userModel.findOne({category: category});
            if(!findByCategory){
                res.status(404).send({status: false, message: "No books with this category exist"});
            }
        }
        if(subcategory){
            let findBySubcategory = await userModel.findOne({subcategory:{$in: [subcategory]}});
            if(!findBySubcategory){
                res.status(404).send({status: false, message: "No books with this Subcategory exist"});
            }
        }

        let books = await bookModel.find(filter)
                                   .select({_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1})
                                   .sort({title: 1});
        if(books.length == 0){
            return res.status(404).send({status: false, message: "No books found with the given query"});
        }

        res.status(200).send({status: true, message: "Book list", data: books});

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const getBookById = async (req, res) => {
    try {
        let id = req.params.bookId;

        if(!id){
            res.status(400).send({status: false, message: "Please enter a book ID."});
        }
        if(!mongoose.Types.ObjectId.isValid(id)){
            res.status(400).send({status: false, message: 'Invalid book id'});
        }

        let bookData = await bookModel.findById(id).select({ISBN: 0, deletedAt: 0, __v: 0});
        if(!bookData){
            res.status(404).send({status: false, message: 'No Book exists with that id'});
        }
        
        let reviews = await reviewModel.find({bookId: id})
        let temp = JSON.stringify(bookData);
        let result = JSON.parse(temp);
        result.reviewsData = reviews;

        res.status(200).send({status: true, message: 'Book list', data: result});
    }catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateBook = async (req, res) => {
    try{
        let id = req.params.bookId;
        if(!id){
            return res.status(400).send({status: false, message: "Please enter a book ID."});
        }
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).send({status: false, message: 'Invalid book id'});
        }

        let bookData = await bookModel.findById(id).select({ISBN: 0, deletedAt: 0, __v: 0});
        if(bookData.userId.toString() !== req.userId){
            return res.status(403).send({status: false, message: 'Unauthorized access'});
        }
        if(!bookData){
            return res.status(404).send({status: false, message: 'No Book exists with that id'});
        }else if(bookData.isDeleted == true){
            return res.status(400).send({status: false, message: 'Book has been deleted'});
        }

        let data = req.body;
        let {title, excerpt, ISBN} = data;

        let fieldsToUpdate = {
            title: title,
            excerpt: data.excerpt,
            releasedAt: data.releasedAt,
            ISBN: data.ISBN
        }

        if (!/^[a-zA-Z0-9 \s]+$/.test(title)) {
            return res.status(400).send({status: false, message: "Please enter a valid title"});
        }
        if (!/^[a-zA-Z\s]+$/.test(excerpt)) {
            return res.status(400).send({status: false, message: "Please enter a valid excerpt"});
        }
        if(!/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN)){
            return res.status(400).send({ status: false, message: "Please enter a valid ISBN number" });
        }

        if(title){
            let checkTitle = await bookModel.findOne({title});
            if(checkTitle){
                return res.status(400).send({status: false, message: "There is a book with that title exists, please give another title"});
            }
        }
        if(ISBN){
            let checkISBN = await bookModel.findOne({ISBN});
            if(checkISBN){
                return res.status(400).send({status: false, message: "There is a book with that ISBN exists, please give another ISBN"});
            }
        }

        let updateBook = await bookModel.findOneAndUpdate(
            {_id: id},
            {$set: {...fieldsToUpdate}},
            {new: true});

            res.status(200).send({status: true, message: 'Success', data: updateBook});

    }
    catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

const deleteById = async function (req,res){
    try{
            let bookId = req.params.bookId;
            let bookData = await bookModel.findOne({_id: bookId});
            if(bookData.userId.toString() !== req.userId){
                return res.status(403).send({status: false, message: 'Unauthorized access'});
            }
            if(!bookData){
                return res.status(404).send({status: false, msg: "Book Not Found"});
            }else if(bookData.isDeleted == true){
                return res.status(400).send({status: false, msg:"Book is already deleted"});
            }

            let date = Date.now()
            let deletedAt = moment(date).format('YYYY-MM-DD, hh:mm:ss')        //formatting date
            let deleteBook = await bookModel.findOneAndUpdate(
                {_id: bookId},
                {$set: {isDeleted: true, deletedAt: deletedAt}},
                {new: true});

            res.status(200).send({status:true,msg:"Book is Deleted"});

    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }
}

module.exports = { createBook, getBooks, getBookById, updateBook, deleteById };
