const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    const authToken = req.get('Authorization');
    if(!authToken){
        const error = new Error('Not authorized');
        error.statusCode = 401;
        throw error;
    }
    const token =authToken.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'validkey');
    }catch{
        error.statusCode = 500;
        throw error;
    }
    if(!decodedToken){
        const error = new Error('Not authorized');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
}