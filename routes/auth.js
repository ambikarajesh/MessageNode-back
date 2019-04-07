const express = require('express')
const {check} = require('express-validator/check');
const User = require('../models/user');
const authController = require('../controllers/auth');
const router = express.Router();

router.put('/signup',[check('email').isEmail().withMessage('Please Enter Valid Email !!!').normalizeEmail().custom((value, {req})=>{
                        return User.findOne({email:value}).then(user => {
                           if(user){
                                return Promise.reject('Email Already Exist !!!')
                            }
                            return true;
                        })
                    }), 
                    check('name').trim().not().isEmpty(),
                    check("password").isLength({min:8}).withMessage("Password Should be Combination of One Uppercase , One Lower case, One Special Char, One Digit and atleast 8 Charaters !!!").trim()], authController.putSignup);
router.post('/login', authController.postLogin)
module.exports = router;