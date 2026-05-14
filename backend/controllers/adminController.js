const User = require('../models/User');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Territory = require('../models/Territory');
const Service = require('../models/Service');

// @desc  Dashboard stats
// @route GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalWorkers, totalCustomers, totalBookings, pendingWorkers, payments] = await Promise.all([
      User.countDocuments(),
      Worker.countDocuments({ status: 'approved' }),
      Customer.countDocuments(),
      Booking.countDocuments(),
      Worker.countDocuments({ status: 'pending' }),
      Payment.find({ paymentStatus: 'paid' }),
    ]);
    const totalRevenue = payments.reduce((sum, p) => sum + p.commission, 0);
    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { totalUsers, totalWorkers, totalCustomers, totalBookings, pendingWorkers, totalRevenue, bookingStats } });
  } catch (err) { next(err); }
};

// @desc  Get all workers with filters
// @route GET /api/admin/workers
exports.getWorkers = async (req, res, next) => {
  try {
    const { status, territory } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (territory) filter.territory = territory;
    const workers = await Worker.find(filter)
      .populate('user', 'name email phone createdAt')
      .populate('territory', 'areaName pincode city')
      .populate('services', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: workers.length, data: workers });
  } catch (err) { next(err); }
};

// @desc  Approve or reject worker
// @route PUT /api/admin/workers/:id/status
exports.updateWorkerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });
    const worker = await Worker.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email');
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (err) { next(err); }
};

// @desc  Assign territory to worker
// @route PUT /api/admin/workers/:id/territory
exports.assignTerritory = async (req, res, next) => {
  try {
    const { territoryId } = req.body;
    const worker = await Worker.findByIdAndUpdate(req.params.id, { territory: territoryId }, { new: true })
      .populate('territory');
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (err) { next(err); }
};

// @desc  Suspend/unsuspend user
// @route PUT /api/admin/users/:id/suspend
exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'suspended'}`, data: user });
  } catch (err) { next(err); }
};

// @desc  Get all bookings with filters
// @route GET /api/admin/bookings
exports.getBookings = async (req, res, next) => {
  try {
    const { territory, worker, service, status } = req.query;
    const filter = {};
    if (territory) filter.territory = territory;
    if (worker) filter.worker = worker;
    if (service) filter.service = service;
    if (status) filter.status = status;
    const bookings = await Booking.find(filter)
      .populate('customer', 'user')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email' } })
      .populate('service', 'name basePrice')
      .populate('territory', 'areaName pincode')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) { next(err); }
};

// @desc  Get all payments
// @route GET /api/admin/payments
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate({ path: 'booking', populate: [{ path: 'service', select: 'name' }, { path: 'customer', populate: { path: 'user', select: 'name' } }, { path: 'worker', populate: { path: 'user', select: 'name' } }] })
      .sort({ createdAt: -1 });
    const totalCommission = payments.filter(p => p.paymentStatus === 'paid').reduce((s, p) => s + p.commission, 0);
    res.json({ success: true, data: payments, totalCommission });
  } catch (err) { next(err); }
};

// @desc  Get all users
// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};
