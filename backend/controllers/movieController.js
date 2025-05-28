// const Movie = require('../models/Movie');

// const getAllMovies = async (req, res) => {
//   try {
//     const movies = await Movie.find().populate('posterId');
//     res.json(movies);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching movies' });
//   }
// };

// const getMovieById = async (req, res) => {
//   try {
//     const movie = await Movie.findById(req.params.id).populate('posterId');
//     if (!movie) {
//       return res.status(404).json({ message: 'Movie not found' });
//     }
//     res.json(movie);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching movie' });
//   }
// };

// const createMovie = async (req, res) => {
//   try {
//     const movie = new Movie(req.body);
//     await movie.save();
//     res.status(201).json(movie);
//   } catch (err) {
//     res.status(500).json({ message: 'Error creating movie' });
//   }
// };

// const updateMovie = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
//       res.json(updatedMovie);
//     } catch (err) {
//       res.status(500).json({ message: 'Помилка при оновленні фільму' });
//     }
//   };

// const deleteMovie = async (req, res) => {
//   try {
//     const movie = await Movie.findByIdAndDelete(req.params.id);
//     if (!movie) {
//       return res.status(404).json({ message: 'Movie not found' });
//     }
//     res.json({ message: 'Movie deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting movie' });
//   }
// };

// module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie }; 
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Poster = require('../models/Poster'); 
const { deleteSessionsByMovieId } = require('./sessionController'); 
// const getAllMovies = async (req, res) => {
//   try {
//     const movies = await Movie.find().populate({
//       path: 'posterId',
//       select: 'url filename' // Отримуємо тільки потрібні поля
//     });
    
//     const transformedMovies = movies.map(movie => ({
//       ...movie._doc,
//       posterUrl: movie.posterId?.url || '/default-poster.jpg'
//     }));
    
//     res.status(200).json(transformedMovies);
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().populate('posterId');
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching movies' });
  }
};


// Решта контролерів залишаються незмінними
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('posterId');
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching movie' });
  }
};


const createMovie = async (req, res) => {
  try {
    console.log('📥 Отримані дані для створення фільму:', req.body);

    const { title, genre, duration, releaseDate, posterId } = req.body;

    if (!title || !genre || !duration || !releaseDate) {
      console.warn('⚠️ Відсутні обовʼязкові поля:', { title, genre, duration, releaseDate });
      return res.status(400).json({ message: 'Відсутні обовʼязкові поля' });
    }

    if (posterId && !mongoose.Types.ObjectId.isValid(posterId)) {
      console.warn('⚠️ Невалідний posterId:', posterId);
      return res.status(400).json({ message: 'Невалідний posterId' });
    }

    const movie = new Movie(req.body);
    await movie.save();

    console.log('✅ Фільм успішно створено:', movie);
    res.status(201).json(movie);
  } catch (err) {
    console.error('🔴 Помилка при створенні фільму:', err);
    res.status(500).json({ message: 'Error creating movie', error: err.message });
  }
};

const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedMovie);
  } catch (err) {
    res.status(500).json({ message: 'Помилка при оновленні фільму' });
  }
};




const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findByIdAndDelete(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await deleteSessionsByMovieId(movieId);

    res.json({ message: 'Movie and related sessions deleted' });
  } catch (err) {
    console.error('Error deleting movie or related sessions:', err);
    res.status(500).json({ message: 'Error deleting movie and related sessions' });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };