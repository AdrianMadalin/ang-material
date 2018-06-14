const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postsRoute = require('./routes/posts');
const path = require('path');

// uFp5AQEVBD8ERdzC
const url = 'mongodb://adi:123qwe@ds253960.mlab.com:53960/mean-app';
mongoose.connect(url).then(() => {
  console.log('Connected to the databse');
}).catch((error) => {
  console.log('My recived error');
  console.log(error);
});

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use('/images', express.static(path.join('server/images')));
app.use(bodyParser.urlencoded({extended: false}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.use('/api/posts', postsRoute);

module.exports = app;
