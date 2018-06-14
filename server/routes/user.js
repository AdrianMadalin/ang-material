const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const bcrypt = require('bcrypt');


router.post('/signup', (req, res, next) => {
  const user = new UserModel({
    email: req.body.email,
    password: req.body.password
  });
  user.save((error, savedUser) => {
    if (error) {
      res.status(502).json({
        message: 'fail',
        error
      })
    } else {
      res.status(200).json({
        message: 'success',
        user: savedUser
      });
    }
  });
});

const cryptPassword = async (saltRounds, myPassword) => {
  return await bcrypt.hash(myPassword, saltRounds)
    .then((hash) => {
      console.log(hash);
      return hash;
    })
    .catch((error) => {
      console.log(error);
    });
};

let test = cryptPassword(5, 'adi');
console.log(test, 'test');

module.exports = router;
