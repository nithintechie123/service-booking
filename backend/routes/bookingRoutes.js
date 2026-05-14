// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking, getMyBookings, cancelBooking,
  getWorkerBookings, respondToBooking, updateJobStatus, getBooking,
} = require('../controllers/bookingController');

router.use(protect);
router.post('/', authorize('customer'), createBooking);
router.get('/my', authorize('customer'), getMyBookings);
router.put('/:id/cancel', authorize('customer'), cancelBooking);
router.get('/worker', authorize('worker'), getWorkerBookings);
router.put('/:id/respond', authorize('worker'), respondToBooking);
router.put('/:id/status', authorize('worker'), updateJobStatus);
router.get('/:id', getBooking);

module.exports = router;
