// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Customer = require('../models/Customer');
const User = require('../models/User');

router.use(protect, authorize('customer'));
router.get('/profile', async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id }).populate('user', 'name email phone');
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
});
router.put('/profile', async (req, res, next) => {
  try {
    const { name, phone, address, pincode, city } = req.body;
    await User.findByIdAndUpdate(req.user._id, { name, phone });
    const customer = await Customer.findOneAndUpdate({ user: req.user._id }, { address, pincode, city }, { new: true }).populate('user', 'name email phone');
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
});

module.exports = router;
