const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: String,
    username: String,
    email: String,
    hashedPassword: String,
    bio: String,
    numFollowers: Number,
    active: Boolean

});

module.exports = mongoose.model('User', UserSchema);