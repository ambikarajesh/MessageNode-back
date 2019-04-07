const express = require('express');
const feedController = require('../controllers/feed');
const {check} = require('express-validator/check');
const isAuth = require('../middleware/isAuth');
const router = express.Router();
router.get('/posts', isAuth, feedController.getPosts);
router.post('/post', isAuth, [
                        check('title').trim().isLength({min:7}),
                        check('content').trim().isLength({min:5})
                    ], feedController.postPost);
router.get('/post/:postId', isAuth, feedController.getPost);
router.put('/post/:postId', isAuth,[
                        check('title').trim().isLength({min:7}),
                        check('content').trim().isLength({min:5})
                    ], feedController.putPost);
router.delete('/post/:postId', isAuth, feedController.deletePost);
module.exports = router;