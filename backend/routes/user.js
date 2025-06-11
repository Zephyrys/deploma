const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const { accessControl } = require('../middleware/accessControl');

const router = express.Router();

router.get('/', authenticate, accessControl('read'), getAllUsers);
router.get('/:id', authenticate, accessControl('read'), getUserById);
router.put('/:id', authenticate, accessControl('update-user'), updateUser);
router.delete('/:id', authenticate, accessControl('delete'), deleteUser);

module.exports = router;
