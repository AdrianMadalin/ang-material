const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = 1860826420087;


router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new UserModel({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(user => {
          res.status(200).json({
            message: 'success',
            user: user
          });
        })
        .catch(error => {
          res.status(502).json({
            message: 'fail',
            error
          });
        });
    })
    .catch(error => {
      res.status(502).json({
        message: 'fail',
        error
      });
    });
});

router.post('/login', (req, res, next) => {
  UserModel.findOne({email: req.body.email})
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (result) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      const token = jwt.sign(
        {email: user.email, userId: user._id},
        jwtSecret,
        {expiresIn: '1h'});
      res.send(200).json({
        message: 'success',
        token: token
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(502).json({
        message: 'fail',
        error
      });
    });
});

module.exports = router;

