const express = require('express');
const {getSessions,getSessionById,createSession,updateSession,deleteSession} = require('../controllers/sessionController');
const authenticate = require('../middleware/authenticate');
const {accessControl} = require('../middleware/accessControl');
const router = express.Router();

router.get('/', getSessions);

router.get('/:id', getSessionById);

router.post('/', authenticate, accessControl('create'), createSession);

router.put('/:id', authenticate, accessControl('update'), updateSession);

router.delete('/:id', authenticate, accessControl('delete'), deleteSession);

module.exports = router;