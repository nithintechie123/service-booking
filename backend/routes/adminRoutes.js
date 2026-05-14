const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard, getWorkers, updateWorkerStatus, assignTerritory,
  suspendUser, getBookings, getPayments, getUsers,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/workers', getWorkers);
router.put('/workers/:id/status', updateWorkerStatus);
router.put('/workers/:id/territory', assignTerritory);
router.put('/users/:id/suspend', suspendUser);
router.get('/bookings', getBookings);
router.get('/payments', getPayments);

module.exports = router;
