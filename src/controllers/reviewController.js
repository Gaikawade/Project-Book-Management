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
            if(isValidDate(reviewedAt)) return res.status(200).send({status: false, message: "Enter date in YYYY-MM-DD format"});
        }
        if(!(rating >=0 && rating <=5)) return res.status(400).send({status: false, message: "Rating should be between 0 and 5"});
        data['rating'] = rating.toFixed(1);     //storing only one decimal value

        let createReview = await reviewModel.create(data);

        await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: +1}}, {new: true})
        res.status(200).send({status: true, data: createReview});

    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

const updateReview = (req, res) => {
    try{

    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

const deleteReview = (req, res) => {
    try{

    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = {createReview, updateReview, deleteReview};