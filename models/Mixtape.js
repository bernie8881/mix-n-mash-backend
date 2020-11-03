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
  // comments: [CommentsModel],
  private: Boolean,
  collaborators: [{
    userId: String,
    username: String,
    privilegeLevel: String,
  }],
  timeCreated: Number,
  likesPerDay: [Number],
  listensPerDay: [Number],
});

module.exports = mongoose.model('Mixtape', MixtapeSchema);