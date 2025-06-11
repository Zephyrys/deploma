const express = require('express');
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  rateMovie
} = require('../controllers/movieController');

const authenticate = require('../middleware/authenticate');
const { accessControl } = require('../middleware/accessControl');

const router = express.Router();

router.get('/', getAllMovies);

router.get('/:id', getMovieById);

router.post('/', authenticate, accessControl('create'), createMovie);

router.put('/:id', authenticate, accessControl('update'), updateMovie);

router.delete('/:id', authenticate, accessControl('delete'), deleteMovie);

router.post('/:id/rate',authenticate, rateMovie);

module.exports = router;
