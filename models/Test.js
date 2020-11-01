const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
    id: String,
    username: String
});

module.exports = mongoose.model('Test', TestSchema);