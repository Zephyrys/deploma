const express = require('express');
const {
  getAllCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema
} = require('../controllers/cinemaController');
const authenticate = require('../middleware/authenticate');
const { accessControl } = require('../middleware/accessControl');

const router = express.Router();

router.get('/', getAllCinemas);
router.get('/:id', getCinemaById);
router.post('/', authenticate, accessControl('create'), createCinema);
router.put('/:id', authenticate, accessControl('update'), updateCinema);
router.delete('/:id', authenticate, accessControl('delete'), deleteCinema);

module.exports = router;
