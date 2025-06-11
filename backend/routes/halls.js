const express = require('express');
const {
  getAllHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall
} = require('../controllers/hallController');
const authenticate = require('../middleware/authenticate');
const { accessControl } = require('../middleware/accessControl');

const router = express.Router();

router.get('/', getAllHalls);
router.get('/:id', getHallById);
router.post('/', authenticate, accessControl('create'), createHall);
router.put('/:id', authenticate, accessControl('update'), updateHall);
router.delete('/:id', authenticate, accessControl('delete'), deleteHall);

module.exports = router;
