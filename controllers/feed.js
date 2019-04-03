const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator/check');
exports.getPosts = (req, res, next) =>{
    Post.find().then(posts =>{
        res.status(200).json({
            message:'Fetch Posts Successfully!!!',
            posts:posts
        })
    }).catch(err =>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })    
}

exports.postPost= (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty){
        const error = new Error('Invalid Input');
        error.statusCode(422);
        throw error;
    }
    if(!req.file){
        const error = new Error('Invalid Image Upload');
        error.statusCode(422);
        throw error;
    }
    const imageUrl = req.file.path.replace('\\', '/');
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({title:title, content:content, imageUrl:imageUrl, creator:{name:'Ambika'}});
    post.save().then(result=> {
        res.status(201).json({
            message:'Post created successfully!!!',
            post: {
                _id: result._id,
                title:title,
                content: content,
                creator:{
                    name:'Ambika'
                },
                createdAt: new Date()
            }
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;            
        }    
        next(err);
    })
   
}


exports.getPost = (req, res, next)=>{
    Post.findById(req.params.postId).then(post =>{
        if(!post){
            const error = new Error("Can't find Post");
            error.statusCode(404);
            throw error;
        }
        res.status(200).json({
            message:'Fetch Post Successfully',
            post: post
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;            
        }    
        next(err);
    })

}

exports.putPost= (req, res, next) =>{
    const postId = req.params.postId;
    const errors = validationResult(req);
    if(!errors.isEmpty){
        const error = new Error('Invalid Input');
        error.statusCode(422);
        throw error;
    } 
    
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file){
        imageUrl = req.file.path.replace('\\', '/');
    }
    if(!imageUrl){
        const error = new Error('Invalid Image Upload');
        error.statusCode(422);
        throw error;
    }
    Post.findById(req.params.postId).then(post =>{
        if(!post){
            const error = new Error("Can't find Post");
            error.statusCode(404);
            throw error;
        }
        if(imageUrl !== post.imageUrl){
            removeImage(post.imageUrl)
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save()
    }).then(result =>{
        res.status(200).json({
            message:'Post Updated Successfully',
            post: result
        })        
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;            
        }    
        next(err);
    })
   
}
exports.deletePost = (req, res, next) =>{
    const postId = req.params.postId;
    Post.findById(postId).then(post =>{
        removeImage(post.imageUrl);
        Post.findByIdAndRemove(postId).then(result =>{
            res.status(200).json({
                message:'Deleted Post Successfully'
            })
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;            
        }    
        next(err);
    })
}


const removeImage = filepath => {
    const Path = path.join(__dirname, '..', filepath);
    console.log(Path);
    fs.unlink(Path, (err) => {
        console.log(err)
    });
}