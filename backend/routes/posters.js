const express = require('express');
const {uploadPoster} = require('../controllers/posterController');
const authenticate = require('../middleware/authenticate');
const {isAdmin} = require('../middleware/isAdmin');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', authenticate, isAdmin, upload.single('poster'), uploadPoster);

module.exports = router;