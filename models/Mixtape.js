const mongoose = require('mongoose');

const MixtapeSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  genres: [String],
  image: [String],
  songs: [{
    name: String,
    youtubeId: String,
  }],
  ownerId: String,
  ownerName: String,
  listens: Number,
  likes: Number,
  dislikes: Number,
  comments: [{
    id: String,	
    userId: String,
    username: String,
    content: String,	
    publishingTime: { type: Date, default: Date.now },
    replies: [{
      userId: String,
      username: String,
      content: String,	
      publishingTime: { type: Date, default: Date.now },
    }],
  }],
  private: Boolean,
  collaborators: [{
    userId: String,
    username: String,
    privilegeLevel: String,
  }],
  timeCreated: { type: Date, default: Date.now },
  likesPerDay: [Number],
  listensPerDay: [Number],
});

module.exports = mongoose.model('Mixtape', MixtapeSchema);