const moment = require("moment");
const { isValidObjectId } = require("mongoose");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const { isValidBody, isbnRegex, isValidFormat, isValidName, isValidDate } = require("../validator/validate");

const createBook = async function (req, res) {
    try {
        let data = req.body;
        if(!isValidBody(data))  return res.status(400).send({status: false, message: "Please enter require data to create Book"});

        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data;

        if (!title)         return res.status(400).send({ status: false, message: "please enter Book title" });
        if (!excerpt)       return res.status(400).send({ status: false, message: "please enter excerpt" });
        if (!userId)        return res.status(400).send({ status: false, message: "please enter userId" });
        if (!ISBN)          return res.status(400).send({ status: false, message: "please enter ISBIN" });
        if (!category)      return res.status(400).send({ status: false, message: "please enter Book category" });
        if (!subcategory)   return res.status(400).send({ status: false, message: "please enter subcategory" });

        if(userId !== req.userId) return res.status(403).send({status: false, message: 'Unauthorized access'});

        if (!isValidFormat(title))     return res.status(400).send({status: false, message: "Please enter title in proper format" });
        if (!isValidFormat(excerpt))   return res.status(400).send({status: false, message: "Please enter excerpt in proper format" });
        if (!isValidObjectId(userId))  return res.status(400).send({ status: false, message: " invalid objectId" });
        if(!isbnRegex(ISBN))           return res.status(400).send({ status: false, message: "Please Enter a valid ISBN number" });
        if (!isValidName(category))    return res.status(400).send({status: false, message: "Please enter category in proper format" });
        if (!isValidName(subcategory)) return res.status(400).send({status: false, message: "Please enter subcategory in proper format",});
        if(reviews){
            if(reviews != 0) return res.status(400).send({status: false, message: "Reviews should be set to 0 while creating a book"});
        }
        if(!isValidDate(releasedAt)) return res.status(400).send({status: false, message:"Enter date in YYYY-MM-DD format"});

        // data['title'] = space(title);
        // console.log(title)

        let getUserId = await userModel.findById({_id: userId});
        if(!getUserId)  return res.status(400).send({status: false, message: "No user exists with the id"});

        let getTitle = await bookModel.findOne({title});
        if(getTitle)   return res.status(400).send({status: false, message: "Title is already exists in our data"})
        
        let getISBN = await bookModel.findOne({ISBN});
        if(getISBN)   return res.status(400).send({status: false, message: "ISBN is already exists in our data"})

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
        let filter = { isDeleted: false, ...data };

        if(userId){
            if(!isValidObjectId(userId)) res.status(400).send({status: false, message: "This is not a valid user id"});
            let findById = await userModel.findOne({userId});
            if(!findById) res.status(404).send({status: false, message: "No user with this id exist"});
        }
        if(category){
            let findByCategory = await userModel.findOne({category: category});
            if(!findByCategory) res.status(404).send({status: false, message: "No books with this category exist"});
        }
        if(subcategory){
            let findBySubcategory = await userModel.findOne({subcategory:{$in: [subcategory]}});
            if(!findBySubcategory) res.status(404).send({status: false, message: "No books with this Subcategory exist"});
        }

        let findBooks = await bookModel.find(filter)
                                       .select({_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1})
                                       .sort({title: 1});
        if(findBooks.length == 0) return res.status(404).send({status: false, message: "No books found with the given query"});

        res.status(200).send({status: true, message: "Book list", data: findBooks});

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const getBookById = async (req, res) => {
    try {
        let id = req.params.bookId;

        if(id){
            if(!isValidObjectId(id)) res.status(400).send({status: false, message: 'Invalid book id'});
        } else res.status(400).send({status: false, message: "Please enter a book ID."});

        let bookData = await bookModel.findOne({_id: id, isDeleted: false}).select({__v: 0});
        if(!bookData)  res.status(404).send({status: false, message: 'No Book exists with that id'});
        
        let reviews = await reviewModel.find({bookId: id}).select({isDeleted: 0, __v: 0});
        let result = bookData.toObject();
        result['reviewsData'] = reviews;

        res.status(200).send({status: true, message: 'Book list', data: result});
    }catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateBook = async (req, res) => {
    try{
        let id = req.params.bookId;
        if(!id) return res.status(400).send({status: false, message: "Please enter a book ID"});

        if(!isValidObjectId(id)) return res.status(400).send({status: false, message: 'Invalid book id'});

        let bookData = await bookModel.findById(id).select({ISBN: 0, deletedAt: 0, __v: 0});

        if(!bookData) return res.status(404).send({status: false, message: 'No Book exists with that id'});
        if(bookData['isDeleted'] == true) return res.status(400).send({status: false, message: 'Book has been deleted'});

        let userIdFromBook = bookData.userId.toString();
        if(userIdFromBook !== req.userId) return res.status(403).send({status: false, message: 'Unauthorized access'});

        let data = req.body;
        let {title, excerpt, ISBN, releasedAt} = data;

        if (!isValidFormat(title))   return res.status(400).send({status: false, message: "Please enter a valid title"});
        if (!isValidFormat(excerpt)) return res.status(400).send({status: false, message: "Please enter a valid excerpt"});
        if(!isbnRegex(ISBN)) return res.status(400).send({ status: false, message: "Please enter a valid ISBN number" });

        if(title){
            let checkTitle = await bookModel.findOne({title});
            if(checkTitle) return res.status(400).send({status: false, message: "There is a book with that title exists, please give another title"});
        }
        if(ISBN){
            let checkISBN = await bookModel.findOne({ISBN});
            if(checkISBN) return res.status(400).send({status: false, message: "There is a book with that ISBN exists, please give another ISBN"});
        }

        if(!isValidDate(releasedAt)) return res.status(400).send({status: false, message:"Enter date in YYYY-MM-DD format"});

        let fieldsToUpdate = {
            title: title,
            excerpt: excerpt,
            releasedAt: releasedAt,
            ISBN: ISBN
        };

        let updateBook = await bookModel.findOneAndUpdate(
            {_id: id},
            {$set: {...fieldsToUpdate}},
            {new: true}
        );
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

            if(!bookData) return res.status(404).send({status: false, msg: "Book Not Found"});
            if(bookData['isDeleted'] == true) return res.status(400).send({status: false, msg: "Book is already deleted"});

            let userIdfromBook = bookData['userId'].toString();
            if(userIdfromBook !== req.userId) return res.status(403).send({status: false, message: 'Unauthorized access'});

            let deleteBook = await bookModel.findOneAndUpdate(
                {_id: bookId},
                {$set: {isDeleted: true, deletedAt: new Date()}},
                {new: true}
            );
            res.status(200).send({status: true,msg: "Book is Deleted"});
    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }
}

module.exports = { createBook, getBooks, getBookById, updateBook, deleteById };
