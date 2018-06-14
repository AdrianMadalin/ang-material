const express = require('express');
const router = express.Router();
const PostModel = require('../models/post');
const multer = require('multer');

const mimetype = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = mimetype[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, 'server/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = mimetype[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.get('/', (req, res, next) => {
  const postsPerPage = +req.query.ppg;
  const currentPage = +req.query.page;
  const postQuery = PostModel.find();
  let fetchedPosts;

  if (postsPerPage && currentPage) {
    postQuery
      .skip(postsPerPage * (currentPage - 1))
      .limit(postsPerPage);
  }

  postQuery.find({}).then(posts => {
    fetchedPosts = posts;
    return PostModel.count();
  }).then(count => {
    console.log(count);
    res.status(200).json({
      message: 'success',
      posts: fetchedPosts,
      maxPosts: count
    });
  }).catch(error => {
    res.status(502).json({
      message: 'fail',
      error
    });
  });
});

router.post('/', multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new PostModel({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  });
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

router.put('/:id', multer({storage: storage}).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new PostModel({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  console.log(post);
  PostModel.updateOne({_id: req.params.id}, post)
    .then(result => {
      res.status(200).json({
        message: 'success',
        post
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
        });
    })
    .catch((error) => {
      res.status(502).json({
        message: `fail to delete post ${req.body.title}`,
        error
      });
    });
});

router.get('/:id', (req, res, next) => {
  PostModel.findById(req.params.id).then((post) => {
    if (post) {
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
