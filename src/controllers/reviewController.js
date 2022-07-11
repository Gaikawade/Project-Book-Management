const { isValidObjectId } = require('mongoose');
const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const {isValidBody, isValidDate, isValidName} = require('../validator/validate');

const createReview = async (req, res) => {
    try{
        let data = req.body;
        let ID = req.params.bookId;
        let {bookId, reviewedBy, reviewedAt, rating} = data;

        if(!req.params.bookId) return res.status(400).send({status: false, message: "Please enter a book ID"});
        if(ID != bookId) return res.status(400).send({status: false, message: "Book ID is not same"});

        if(!isValidBody(data)) return res.status(400).send({status: false, message: 'Data is required in order to give review'});

        if(!bookId) return res.status(400).send({status: false, message: "Book ID is required"});
        if(!rating) return res.status(400).send({status: false, message: "Rating is required"});

        if(!isValidObjectId(bookId)) return res.status(400).send({status: false, message: "Invalid book ID"});
        let findBook = await bookModel.findById(bookId);
        if(!findBook) return res.status(404).send({status: false, message: "No Book found with that ID"});
        if(findBook['isDeleted'] == true) return res.status(400).send({status: false, message: "Book has been deleted"});

        if(reviewedBy){
            if(!isValidName(reviewedBy)) return res.status(400).send({status: false, message: "Invalid Reviewer name is required"});
        }
        if(reviewedAt){
            if(!isValidDate(reviewedAt)) return res.status(200).send({status: false, message: "Enter date in YYYY-MM-DD format"});
        }//else{
            
        // }

        if(!(rating >=0 && rating <=5)) return res.status(400).send({status: false, message: "Rating should be between 0 and 5"});
        data['rating'] = rating.toFixed(1);     //storing only one decimal value

        let createReview = await reviewModel.create(data);
        let result = findBook.toObject();
        result.reviewsData = [createReview];
        await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: +1}}, {new: true})
        res.status(200).send({status: true, data: result});

    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateReview = async (req, res) => {
    try{
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        let data = req.body;

        let book = await bookModel.findById(bookId);
        if(book){
            if(book['isDeleted'] == true) return res.status(400).send({status: false, message: "The book has been deleted"});
        }else return res.status(404).send({status: false, message: "Book not found"});

        let review = await reviewModel.findById(reviewId);
        if(review){
            if(review['isDeleted'] == true) return res.status(400).send({status: false, message:"Review has been deleted"});
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

        let book = await bookModel.findById(bookId);
        if(book){
            if(book['isDeleted'] == true) return res.status(400).send({status: false, message: "The book has been deleted"});
        }else return res.status(404).send({status: false, message: "Book not found"});

        let review = await reviewModel.findById(reviewId);
        if(review){
            if(review['isDeleted'] == true) return res.status(400).send({status: false, message:"Review has been deleted"});
        }else return res.status(404).send({status: false, message: "Review not found"});

        await reviewModel.findOneAndUpdate({_id: reviewId},{isDeleted: true},{new: true});
        await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: -1}}, {new: true});

        res.status(200).send({status: true, message: "Review deleted successfully"});
    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = {createReview, updateReview, deleteReview};