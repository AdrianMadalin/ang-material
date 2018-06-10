const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const PostModel = require('./models/post');

// uFp5AQEVBD8ERdzC
const url = 'mongodb://adi:123qwe@ds253960.mlab.com:53960/mean-app';
mongoose.connect(url).then(() => {
  console.log('Connected to the databse');
}).catch((error) => {
  console.log('My recived error');
  console.log(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.get('/api/posts', (req, res, next) => {
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

app.post('/api/posts', (req, res, next) => {
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

app.put('/api/posts/:id', (req, res, next) => {
  const post = new PostModel({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  });
  PostModel.updateOne({_id: req.params.id}, post)
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'success'
      });
    })
});

app.delete('/api/posts/:id', (req, res, next) => {
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
      })
    });
});

module.exports = app;
