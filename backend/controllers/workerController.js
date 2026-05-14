const Worker = require('../models/Worker');
const User = require('../models/User');

// @desc  Get worker profile
// @route GET /api/workers/profile
exports.getProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate('territory')
      .populate('services');
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (err) { next(err); }
};

// @desc  Update profile
// @route PUT /api/workers/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, skills, bio, experience, hourlyRate } = req.body;
    // Update user name/phone
    await User.findByIdAndUpdate(req.user._id, { name, phone });
    const worker = await Worker.findOneAndUpdate(
      { user: req.user._id },
      { skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()), bio, experience, hourlyRate },
      { new: true }
    ).populate('user', 'name email phone').populate('territory').populate('services');
    res.json({ success: true, data: worker });
  } catch (err) { next(err); }
};

// @desc  Toggle availability
// @route PUT /api/workers/availability
exports.toggleAvailability = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    if (worker.availability === 'busy')
      return res.status(400).json({ success: false, message: 'Cannot toggle while a job is in progress' });
    worker.availability = worker.availability === 'available' ? 'unavailable' : 'available';
    await worker.save();
    res.json({ success: true, data: { availability: worker.availability } });
  } catch (err) { next(err); }
};

// @desc  Get workers by territory (for customer booking)
// @route GET /api/workers/territory/:pincode
exports.getWorkersByTerritory = async (req, res, next) => {
  try {
    const { pincode } = req.params;
    const Territory = require('../models/Territory');
    const territory = await Territory.findOne({ pincode, isActive: true });
    if (!territory)
      return res.status(404).json({ success: false, message: 'No territory found for this pincode' });

    const workers = await Worker.find({ territory: territory._id, status: 'approved', availability: 'available' })
      .populate('user', 'name')
      .populate('services', 'name')
      .select('rating totalReviews skills bio hourlyRate experience');
    res.json({ success: true, territory, data: workers });
  } catch (err) { next(err); }
};

// @desc  Get worker earnings & job history
// @route GET /api/workers/earnings
exports.getEarnings = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id }).select('earnings totalJobs rating');
    const Payment = require('../models/Payment');
    const Booking = require('../models/Booking');
    const payments = await Payment.find()
      .populate({ path: 'booking', match: { worker: worker._id }, populate: { path: 'service', select: 'name' } });
    const valid = payments.filter(p => p.booking);
    res.json({ success: true, data: { earnings: worker.earnings, totalJobs: worker.totalJobs, rating: worker.rating, payments: valid } });
  } catch (err) { next(err); }
};
