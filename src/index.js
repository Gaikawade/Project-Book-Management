const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
// const { AppCongif } = require('aws-sdk');
const route  = require("./routes/route");
const app = express();

app.use(bodyParser.json());
app.use(multer().any());

const url = "mongodb+srv://Mahesh8985:lz9fOW52615YVat4@cluster0.l5fafvk.mongodb.net/Project-3_Book_Managament";

mongoose.connect(url,{useNewUrlParser:true})
.then(()=>console.log("Hi, I'm MongoDB and I'm here to save your data"))
.catch(err=>console.log(err.message));

app.use('/',route);

app.listen(process.env.PORT || 3000,function(){
    console.log("Express app is running on PORT "+(process.env.PORT || 3000));
})