const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// @desc  Register customer
// @route POST /api/auth/register/customer
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, pincode, city } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'customer', phone });
    await Customer.create({ user: user._id, address, pincode, city });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

// @desc  Register worker
// @route POST /api/auth/register/worker
exports.registerWorker = async (req, res, next) => {
  try {
    const { name, email, password, phone, skills, territoryId, bio, experience, hourlyRate } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'worker', phone });
    await Worker.create({
      user: user._id,
      territory: territoryId || null,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
      documentPath: req.file ? req.file.path : null,
      bio, experience, hourlyRate,
      status: 'pending',
    });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

// @desc  Login all roles
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });

    // Attach profile
    let profile = null;
    if (user.role === 'worker') profile = await Worker.findOne({ user: user._id }).populate('territory services');
    if (user.role === 'customer') profile = await Customer.findOne({ user: user._id });

    const token = signToken(user._id);
    user.password = undefined;
    res.json({ success: true, token, user, profile });
  } catch (err) { next(err); }
};

// @desc  Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    let profile = null;
    if (req.user.role === 'worker') profile = await Worker.findOne({ user: req.user._id }).populate('territory services');
    if (req.user.role === 'customer') profile = await Customer.findOne({ user: req.user._id });
    res.json({ success: true, user: req.user, profile });
  } catch (err) { next(err); }
};
