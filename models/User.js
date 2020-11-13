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
    genrePreferences: [
        {genre: String, genreIncVal: Number}
    ],
    sentMashmateRequests: [
        {
            senderId: String,
            recipientId: String,
            username: String,
            timeSent: { type: Date, default: Date.now },
            seen: Boolean
        }
    ],
    receivedMashmateRequests: [
        {
            senderId: String,
            recipientId: String,
            username: String,
            timeSent: { type: Date, default: Date.now },
            seen: Boolean
        }
    ],
    active: Boolean
});

module.exports = mongoose.model('User', UserSchema);