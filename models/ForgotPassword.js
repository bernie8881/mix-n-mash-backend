const mongoose = require('mongoose');

const ForgotPasswordSchema = new mongoose.Schema({
    id: String,
    email: String,
    timeCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ForgotPassword', ForgotPasswordSchema);