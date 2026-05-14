const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, toggleAvailability, getWorkersByTerritory, getEarnings } = require('../controllers/workerController');

router.get('/territory/:pincode', getWorkersByTerritory);
router.get('/reviews/:workerId', require('../controllers/reviewController').getWorkerReviews);

router.use(protect, authorize('worker'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/availability', toggleAvailability);
router.get('/earnings', getEarnings);

module.exports = router;
