const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const token = req.headers['x-api-key'];
        if(!token) token = req.headers['X-API-KEY'];
        if(!token){
            res.status(400).send({status: false, message: "token must be present in headers"});
        }
        let decodedToken = jwt.verify(token, "Project-3-Group-43");
        if (!decodedToken) {
            return res.status(400).send({status: false, message: "Please enter a valid token"});
        }
        req.userId = decodedToken.userId;
        next();
    }
    catch(err) {
        return res.status(500).send({status: false, message: err.message});
    }
}

module.exports = {authenticate};