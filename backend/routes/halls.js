const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');

// GET всі зали
router.get('/', hallController.getAllHalls);

// GET один зал по id
router.get('/:id', hallController.getHallById);

// POST створити зал
router.post('/', hallController.createHall);

// PUT оновити зал
router.put('/:id', hallController.updateHall);

// DELETE видалити зал
router.delete('/:id', hallController.deleteHall);

module.exports = router;
