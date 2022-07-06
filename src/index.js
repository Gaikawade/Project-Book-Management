const express = require('express');
const boydParser = require('body-parser');
const {default:mongoose} = require('mongoose');
const bodyParser = require('body-parser');
const route  = require("./routes/route");
const app = express();

app.use(bodyParser.json());

const url = "mongodb+srv://Mahesh8985:lz9fOW52615YVat4@cluster0.l5fafvk.mongodb.net/Project-3_Book_Managament";

mongoose.connect(url,{useNewUrlParser:true})
.then(()=>console.log("Hi, I'm MongoDB and I'm here to save your data"))
.catch(err=>console.log(err.message));

app.use('/',route);

app.listen(process.env.PORT || 3000,function(){
    console.log("Express app is running on PORT "+(process.env.PORT || 3000));
})