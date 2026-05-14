// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Payment = require('../models/Payment');

router.put('/:id/pay', protect, authorize('customer'), async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'paid', transactionId: `TXN-${Date.now()}`, paymentMethod: req.body.method || 'online' },
      { new: true }
    ).populate({ path: 'booking', populate: 'service' });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
});

router.get('/booking/:bookingId', protect, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
});

module.exports = router;
