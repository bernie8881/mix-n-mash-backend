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
  likesOverTime: [
    {
      time: {type: Date, default: Date.now},
      userId: String
    }
  ],
  listensOverTime: [
    {
      time: {type: Date, default: Date.now},
      userId: String
    }
  ],
  ownerActive: Boolean
});

module.exports = mongoose.model('Mixtape', MixtapeSchema);