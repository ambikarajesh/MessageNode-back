const express = require('express');
const bodyParser = require('body-parser');
const feedRouter = require('./routes/feed');
const authRouter = require('./routes/auth');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const compression = require('compression');
const helmet = require('helmet');
const app = express();

const mongoDB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@cluster0-btzl5.mongodb.net/${process.env.MONGO_DATABASE}`;

var fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        const now = new Date().toISOString(); 
        const date = now.replace(/:/g, '-'); 
        cb(null, date +'-'+file.originalname); 
    }
  })
const fileFilter = (req, file, cb) =>{
    if(file.mimetype ==='image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'))
app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})
app.use(helmet());
app.use(compression());
app.use('/feed', feedRouter);
app.use('/auth', authRouter);
app.use((error, req, res, next)=>{
    res.status(error.statusCode).json({
        message:error.message,
        data: error.data
    })
})
mongoose.connect(encodeURI(mongoDB_URI)).then(result => {   
    app.listen(8080)
}).catch(err =>console.log(err))
