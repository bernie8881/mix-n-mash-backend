var mongoose = require('mongoose');

var ReplySchema = new mongoose.Schema({
  content: String,
  userId: Number,
  username: String,
  publishingTime: Number,
});

module.exports = mongoose.model('Reply', ReplySchema);