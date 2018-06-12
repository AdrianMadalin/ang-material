const express = require('express');
const router = express.Router();
const PostModel = require('../models/post');

router.get('/', (req, res, next) => {
  PostModel.find({}).then(posts => {
    res.status(200).json({
      message: 'success',
      posts
    });
  }).catch(error => {
    res.status(502).json({
      message: 'fail',
      error
    })
  });
});

router.post('/', (req, res, next) => {
  const post = new PostModel({title: req.body.title, content: req.body.content});
  post.save((error, savedPost) => {
    if (error) {
      res.status(502).json({
        message: 'fail',
        error
      })
    } else {
      res.status(200).json({
        message: 'success',
        post: savedPost
      });
    }
  });
});

router.put('/:id', (req, res, next) => {
  const post = new PostModel({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  });
  PostModel.updateOne({_id: req.params.id}, post)
    .then(result => {
      res.status(200).json({
        message: 'success'
      });
    });
});

router.delete('/:id', (req, res, next) => {
  PostModel.find({_id: req.params.id})
    .then((post) => {
      PostModel.deleteOne({_id: post[0]._id})
        .then(() => {
          res.status(200).json({
            message: 'success',
            deletedPost: post
          });
        })
    })
    .catch((error) => {
      res.status(502).json({
        message: `fail to delete post ${req.body.title}`,
        error
      });
    });
});

router.get('/:id', (req,res,next) =>{
  PostModel.findById(req.params.id).then((post) =>{
    if(post) {
      res.status(200).json({
        message: 'success',
        post
      });
    } else {
      res.status(404).json({
        message: 'fail'
      });
    }
  });
});

module.exports = router;
