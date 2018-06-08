const express = require('express');
const app = express();

app.use('/api/posts', (req, res, next) => {
  const posts = [
    {
      id: 1,
      title: 'First',
      content: 'First task comming from the server'
    },
    {
      id: 2,
      title: 'Second',
      content: 'Second task comming from the server'
    }
  ];
  res.status(200).json({
    message: 'Success',
    posts: posts
  });
});

module.exports = app;
