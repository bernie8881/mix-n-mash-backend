const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: String,
    username: String,
    email: String,
    hashedPassword: String,
    bio: String,
    numFollowers: Number,
    following: [String],
    mashmates: [
        {id: String, username: String}
    ],
    mixtapes: [String],
    likedMixtapes: [String],
    dislikedMixtapes: [String],
    genrePreferences: [
        {genre: String, val: Number}
    ],
    receivedMashmateRequests: [
        {
            senderId: String,
            username: String,
            timeSent: { type: Date, default: Date.now },
            seen: Boolean
        }
    ],
    active: Boolean
});

module.exports = mongoose.model('User', UserSchema);