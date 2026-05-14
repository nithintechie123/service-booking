// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerCustomer, registerWorker, login, getMe } = require('../controllers/authController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/register/customer', registerCustomer);
router.post('/register/worker', upload.single('document'), registerWorker);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
