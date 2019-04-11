const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator/check');
exports.getPosts = (req, res, next) =>{
    const currentPage = req.query.page;
    const perPage = 2;
    let totalItems = 0;
    Post.find().countDocuments().then(count => {
        totalItems = count || 1;
        return Post.find().skip((currentPage - 1) *perPage).limit(perPage);
    }).then(posts =>{
        res.status(200).json({
            message:'Fetch Posts Successfully!!!',
            posts:posts,
            totalItems: totalItems
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
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const error = new Error('Invalid Image Upload');
        error.statusCode = 422;
        throw error;
    }
    
    const imageUrl = req.file.path.replace('\\', '/');
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({title:title, content:content, imageUrl:imageUrl, creator:req.userId});
    post.save().then(result => {        
        return User.findById(req.userId)
    }).then(user =>{
            console.log(post)
            author = user;
            user.posts.push(post._id);
            return user.save();
        }).then(result =>{
            res.status(201).json({
                message:'Post created successfully!!!',
                post: post,
                user:author
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
            error.statusCode = 404;
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
        error.statusCode = 422;
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
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString()!== req.userId){
            const error = new Error("Not authorized");
            error.statusCode = 403;
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
        if(post.creator.toString()!== req.userId){
            const error = new Error("Not authorized");
            error.statusCode = 403;
            throw error;
        }
        removeImage(post.imageUrl);
        User.findById(req.userId).then(user=>{
            user.posts.pull(postId);
            return user.save();
        }).then(result =>{
            return Post.findByIdAndRemove(postId)
        }).then(result =>{
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