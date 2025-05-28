const express = require('express');
const {getSessions,getSessionById,createSession,updateSession,deleteSession} = require('../controllers/sessionController');
const authenticate = require('../middleware/authenticate');
const {isAdmin} = require('../middleware/isAdmin');
const router = express.Router();

router.get('/', getSessions);

router.get('/:id', getSessionById);

router.post('/', authenticate, isAdmin, createSession);

router.put('/:id', authenticate, isAdmin, updateSession);

router.delete('/:id', authenticate, isAdmin, deleteSession);

module.exports = router;