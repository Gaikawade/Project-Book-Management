const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");

const createUser = async function(req,res){
   try{
        const data = req.body;
        if(Object.keys(data).length == 0){
            return res.status(400).send({status: false, message: "Provide Some Data to Create User"});
        }
        let {title, name, phone, email, password, address} = data;

        if(!title){
            return res.status(400).send({status: false, message: "Please Enter title"});
        }
        if(!name){
            return res.status(400).send({status :false, message: "Please Enter Name"});
        }
        if(!phone){
            return res.status(400).send({status: false, message: "Please Enter phone"});
        }
        if(!email){
            return res.status(400).send({status: false, message: "Please Enter email"});
        }
        if(!password){
            return res.status(400).send({status: false, message: "Please Enter password"});
        }
        if(!address){
            return res.status(400).send({status: false, message: "Please Enter address"});
        }

        if (["Mr", "Mrs", "Miss"].indexOf(title) == -1){
         return res.status(400).send({status: false, message: "Enter a valid title Mr or Mrs or Miss ",});
        }        
        if(!/^[a-zA-Z \s]+$/.test(name)){
            return res.status(400).send({status: false, message: "Please Enter Only Alphabets in Name"});
        }        
        if(!/^[6-9]\d{9}$/.test(phone)){
            return res.status(400).send({status: false,message: "Please Enter Valid Phone Number"});
        }
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            return res.status(400).send({status: false,message: "Please Enter Valid Email Id"});
        }
        if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password)){
            return res.status(400).send({status: false,message: "Password Should Contain at Least One Capital Letter and One Special Char and a number and length btwn 8-15"});
        }
        if(!/^\d{6}$/.test(address.pincode)){
            return res.status(400).send({status: false, message: "Please enter a valid pincode"})
        }

        let phoneCheck = await userModel.findOne({ phone });
        if (phoneCheck){
        return res.status(400).send({ status: false, message: "User With This Phone already Registerd" });
        }
        let emailCheck = await userModel.findOne({ email });
        if (emailCheck){
        return res.status(400).send({ status: false, message: "Email-Id already Registerd" });
        }

        name = name.replace(/\s\s+/g, ' ');     //removing spaces between first and last name
        data['name'] = name;

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
        if(!email){
            return res.status(400).send({status: false, message:"Please Enter email"});
        }
        if(!password){
            return res.status(400).send({status: false, message:"Please Enter password"});
        }

        const userId =  await userModel.findOne({email});
        if(!userId){
            return res.status(404).send({status: false, message:"User not found"});
        }
        let user = await userModel.findOne({email: email, password: password});
        if(!user){
            return res.status(400).send({status: false, message: "Invalid password"});
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            expiresIn: "30d" },
            "Project-3-Group-43");

        res.setHeader("x-api-key",token);
        return res.status(201).send({status: true, message: "User LoggedIn Succesfully", data: {token: token}});
    }
    catch(err){
        return res.status(500).send({status: false,message: err.message});
    }
}

module.exports = {createUser,loginUser};