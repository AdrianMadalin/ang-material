const express = require('express');
const router = express.Router();
const PostModel = require('../models/post');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

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
    res.status(200).json({
      message: 'success',
      posts: fetchedPosts,
      maxPosts: count
    });
  }).catch(error => {
    res.status(502).json({message: 'Failed to fetch posts', error});
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
  }).catch((error) => {
    res.status(502).json({message: 'Failed to fetch the post', error});
  });
});

router.post('/', checkAuth, multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new PostModel({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then((savedPost) => {
    res.status(200).json({
      message: 'success',
      post: savedPost
    });
  }).catch((error) => {
    res.status(500).json({message: 'Creating a post failed', error});
  });
});

router.put('/:id', checkAuth, multer({storage: storage}).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new PostModel({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  PostModel.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
    .then(result => {
      if (result.nModified > 0) {
        res.status(200).json({message: 'success', post});
      } else {
        return res.status(401).json({message: 'User not authorized'});
      }
    })
    .catch(error => {
      res.status(502).json({message: 'Fail to update post in the database', error});
    });
});

router.delete('/:id', checkAuth, (req, res, next) => {
  PostModel.find({_id: req.params.id})
    .then((post) => {
      PostModel.deleteOne({_id: post[0]._id, creator: req.userData.userId})
        .then((result) => {
          console.log(result);
          if (result.n > 0) {
            res.status(200).json({message: 'success', deletedPost: post});
          } else {
            return res.status(401).json({message: 'User not authorized'});
          }
        });
    })
    .catch((error) => {
      res.status(502).json({message: `fail to delete post ${req.body.title}`, error});
    });
});


module.exports = router;
