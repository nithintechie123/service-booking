const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { submitReview, getWorkerReviews } = require('../controllers/reviewController');

router.post('/', protect, authorize('customer'), submitReview);
router.get('/worker/:workerId', getWorkerReviews);

module.exports = router;
