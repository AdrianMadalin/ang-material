const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';


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
          res.status(502).json({message: 'Invalid authentication credentials', error});
        });
    })
    .catch(error => {
      res.status(502).json({
        message: 'fail',
        error
      });
    });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  UserModel.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        return res.sendStatus(401).json({
          message: "Auth failed"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.sendStatus(401).json({message: "Auth failed"});
      }
      const token = jwt.sign(
        {email: fetchedUser.email, userId: fetchedUser._id},
        "secret_this_should_be_longer",
        {expiresIn: "1h"}
      );
      res.send({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(error => {
      return res.status(502).json({message: 'Invalid authentication credentials', error});
    });
});

module.exports = router;

