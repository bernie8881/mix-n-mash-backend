var ReplyModel = require('../models/Reply');

var mongoose = require('mongoose');

var CommentsSchema = new mongoose.Schema({
  id: number,
  replies: [ReplyModel],
  userId: number,
  username: string,
  content: string,
  publishingTime: number,
});

module.exports = mongoose.model('Comments', CommentsSchema);