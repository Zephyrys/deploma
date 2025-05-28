const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  description: { type: String }, 
  genre: { type: String, required: true }, 
  duration: { type: Number, required: true }, 
  releaseDate: { type: Date, required: true }, 
  posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poster' }, 
  rating: { type: Number, min: 1, max: 10 }, 
});

module.exports = mongoose.model('Movie', movieSchema);