var mongoose = require('mongoose');

var CollaboratorSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  privilegeLevel: String,
});

module.exports = mongoose.model('Collaborator', CollaboratorSchema);