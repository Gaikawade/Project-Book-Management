const { isValidObjectId } = require('mongoose');
const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const {isValidBody, isValidDate, isValidName, isValidFormat} = require('../validator/validate');

const createReview = async (req, res) => {
    try{
        let data = req.body;
        let ID = req.params.bookId;
        let {bookId, reviewedBy, reviewedAt, rating} = data;

        if(!req.params.bookId) return res.status(401).send({status: false, message: "Please enter a book ID"});
        if(!isValidObjectId(ID)) return res.status(401).send({status: false, message: 'Invalid book id'});
        if(!isValidBody(data)) return res.status(401).send({status: false, message: 'Data is required in order to give review'});

        if(bookId){
            if(ID != bookId) return res.status(401).send({status: false, message: "Book ID is not same"});
        }

        if(!bookId) return res.status(401).send({status: false, message: "Book ID is required"});
        if(!rating) return res.status(401).send({status: false, message: "Rating is required"});

        if(!isValidObjectId(bookId)) return res.status(401).send({status: false, message: "Invalid book ID"});
        let findBook = await bookModel.findById(bookId);
        if(!findBook) return res.status(404).send({status: false, message: "No Book found with that ID"});
        if(findBook['isDeleted'] == true) return res.status(401).send({status: false, message: "Book has been deleted"});

        if(reviewedBy){
            if(!isValidName(reviewedBy)) return res.status(401).send({status: false, message: "Invalid Reviewer name"});
        }
        if(reviewedAt){
            if(!isValidDate(reviewedAt)) return res.status(200).send({status: false, message: "Enter date in YYYY-MM-DD format"});
        }
        if(data.review){
            if(!isValidFormat(data.review)) return res.status(401).send({status: false, message: "Invalid review format"});
        }

        if(!(rating >=1 && rating <=5)) return res.status(401).send({status: false, message: "Rating should be between 1 and 5"});
        data['rating'] = rating.toFixed(0);     //storing only one decimal value

        let createReview = await reviewModel.create(data);
        let update = await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: +1}}, {new: true})
                                    .select({_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1});
        let result = update.toObject();
        result.reviewsData = [createReview];
        res.status(201).send({status: true, message: "Review Created successfully", data: result});

    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateReview = async (req, res) => {
    try{
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        let data = req.body;

        if(!isValidObjectId(bookId)) return res.status(401).send({status: false, message: 'Invalid book id'});
        if(!isValidObjectId(reviewId)) return res.status(401).send({status: false, message: 'Invalid review id'});

        let book = await bookModel.findById(bookId);
        if(book){
            if(book['isDeleted'] == true) return res.status(401).send({status: false, message: "The book has been deleted"});
        }else return res.status(404).send({status: false, message: "Book not found"});

        let review = await reviewModel.findById(reviewId);
        if(review){
            if(review['isDeleted'] == true) return res.status(401).send({status: false, message:"Review has been deleted"});
        }else return res.status(404).send({status: false, message: "Review not found"});

        let update = await reviewModel.findOneAndUpdate({_id: review},{$set: data},{new: true});
        let result = book.toObject();
        result.reviewsData = update;
        res.status(200).send({status: true, message: "Review Update Successfully", date: result});

    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

const deleteReview = async (req, res) => {
    try{
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;

        if(!isValidObjectId(bookId)) return res.status(401).send({status: false, message: 'Invalid book id'});
        if(!isValidObjectId(reviewId)) return res.status(401).send({status: false, message: 'Invalid review id'});

        let book = await bookModel.findById(bookId);
        if(book){
            if(book['isDeleted'] == true) return res.status(401).send({status: false, message: "The book has been deleted"});
        }else return res.status(404).send({status: false, message: "Book not found"});

        let review = await reviewModel.findById(reviewId);
        if(review){
            if(review['isDeleted'] == true) return res.status(401).send({status: false, message:"Review has been deleted"});
        }else return res.status(404).send({status: false, message: "Review not found"});
 
        await reviewModel.findOneAndUpdate({_id: reviewId},{isDeleted: true},{new: true});
        await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: -1}}, {new: true});

        res.status(200).send({status: true, message: "Review deleted successfully"});
    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = {createReview, updateReview, deleteReview};