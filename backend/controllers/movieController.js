const Movie = require('../models/Movie');
const mongoose = require('mongoose');
const { deletePosterById } = require('./posterController');
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().populate('posterId'); 
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching movies' });
  }
};


const getMovieById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }
  try {
    const movie = await Movie.findById(id).populate('posterId');
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching movie' });
  }
};

const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    console.log('[createMovie] Movie Created: ', movie)
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateMovie = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(updatedMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteMovie = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }
  try {
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (movie.posterId) {
      try {
        await deletePosterById(movie.posterId);
      } catch (err) {
        console.error('Помилка при видаленні постера:', err);
      }
    }

    await Movie.findByIdAndDelete(id);

    res.json({ message: 'Movie and its poster deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting movie' });
  }
};
const rateMovie = async (req, res) => {
  const { movieId, rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 10) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 10' });
  }

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const currentTotal = (movie.rating || 0) * (movie.ratingCount || 0);
    const newCount = (movie.ratingCount || 0) + 1;
    const newAverage = (currentTotal + rating) / newCount;

    movie.rating = newAverage;
    movie.ratingCount = newCount;

    await movie.save();

    return res.json({
      message: 'Rating updated successfully',
      movie,
    });
  } catch (err) {
    console.error('Error updating rating:', err);
    return res.status(500).json({ message: 'Server error while updating rating' });
  }
};





module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  rateMovie
};
