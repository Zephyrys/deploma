const express = require('express');
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const authenticate = require('../middleware/authenticate');
const {isAdmin} = require('../middleware/isAdmin');
const router = express.Router();

router.get('/', getAllMovies);

router.get('/:id', getMovieById);

router.post('/', authenticate, isAdmin, createMovie);

router.put('/:id', authenticate, isAdmin, updateMovie);

router.delete('/:id', authenticate, isAdmin, deleteMovie);

module.exports = router;