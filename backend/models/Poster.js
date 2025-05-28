const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true }, 
  url: { type: String, required: true }, 
  contentType: { type: String, required: true }, 
});

module.exports = mongoose.model('Poster', posterSchema);