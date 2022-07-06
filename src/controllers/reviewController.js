const reviewModel = require("../models/reviewModel");

const createReview = async (req, res) => {
    try{
        
    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = {createReview};