const express = require('express');
const feedController = require('../controllers/feed');
const {check} = require('express-validator/check');
const router = express.Router();
router.get('/posts', feedController.getPosts);
router.post('/post', [
                        check('title').trim().isLength({min:7}),
                        check('content').trim().isLength({min:5})
                    ], feedController.postPost);
router.get('/post/:postId', feedController.getPost);
router.put('/post/:postId',[
                        check('title').trim().isLength({min:7}),
                        check('content').trim().isLength({min:5})
                    ], feedController.putPost);
router.delete('/post/:postId', feedController.deletePost);
module.exports = router;