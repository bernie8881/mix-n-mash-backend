const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  id: String,
  replies: [{
    userId: String,
    username: String,
    content: String,	
    publishingTime: Number,	
  }],
  userId: String,
  username: String,
  content: String,	
  publishingTime: Number,	
  });

module.exports = mongoose.model('Comment', CommentSchema);