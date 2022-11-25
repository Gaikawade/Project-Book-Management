const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");
const { isValidBody, isValidTitle, isValidMobile, isValidEmail, isValidPassword, isValidName } = require('../validator/validate');

const createUser = async function(req,res){
   try{
        let data = req.body;
        if(!isValidBody(data))  return res.status(401).send({status: false, message: "Provide Some Data to Create User"});

        let {title, name, phone, email, password, address} = data;

        if(!title)       return res.status(401).send({status: false, message: "Title is required"});
        if(!name)        return res.status(401).send({status :false, message: "Name is required"});
        if(!phone)       return res.status(401).send({status: false, message: "Phone number is required"});
        if(!email)       return res.status(401).send({status: false, message: "Email is required"});
        if(!password)    return res.status(401).send({status: false, message: "Password is required"});

        if(!isValidTitle(title))        return res.status(401).send({status: false, message: "Title should be Mr/ Mrs/ Miss",});
        if(!isValidName(name))          return res.status(401).send({status: false, message: "Please enter Name in valid format"});
        if(!isValidMobile(phone))       return res.status(401).send({status: false,message: "Please enter Valid Phone Number"});
        if(!isValidEmail(email))        return res.status(401).send({status: false,message: "Please enter Valid Email Id"});
        if(!isValidPassword(password))  return res.status(401).send({status: false,message: "Password Should be 8-15 characters which contains at least one numeric digit, one uppercase and one special character"});
        if(address){
            if(!/^\d{6}$/.test(address.pincode))    return res.status(401).send({status: false, message: "Please enter a valid pincode"})
        }

        let phoneCheck = await userModel.findOne({ phone });
        if (phoneCheck)  return res.status(401).send({ status: false, message: "Phone number is already Registerd" });

        let emailCheck = await userModel.findOne({ email });
        if (emailCheck)  return res.status(401).send({ status: false, message: "Email-Id is already Registerd" });

        const user = await userModel.create(data);
        return res.status(201).send({status: true, message: "User Is Created Succefully", data:user});
    }
    catch(err){
        return res.status(500).send({status: false, message: err.message});
    }
}

const loginUser = async function(req,res){
    try{
        const data = req.body;
        const {email, password} = data;

        if(!email)      return res.status(401).send({status: false, message:"Please enter email"});
        if(!password)   return res.status(401).send({status: false, message:"Please enter password"});

        const userId =  await userModel.findOne({email});
        if(!userId)     return res.status(404).send({status: false, message:"User not found"});

        let user = await userModel.findOne({email: email, password: password});
        if(!user)  return res.status(401).send({status: false, message: "Invalid password"});

        const token = jwt.sign(
            {
                userId: user._id.toString(),
            },"Project-3-Group-43",
            {expiresIn: '2h'}
        );

        res.setHeader("x-api-key",token);
        res.status(201).send({status: true, message: "User LoggedIn Succesfully", data: {token: token}});
    }
    catch(err){
        return res.status(500).send({status: false,message: err.message});
    }
}

module.exports = {createUser, loginUser};