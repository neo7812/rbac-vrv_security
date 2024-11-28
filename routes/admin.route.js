const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { roles } = require('../utils/constants');
const User = require('../models/user.model');

const router = express.Router();

// Middleware for validating ID
const validateObjectId = (req, res, next) => {
  const { id } = req.body || req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid ID format');
    return res.status(400).redirect('back');
  }
  next();
};

// Get All Users with Optional Search and Pagination
router.get('/users', async (req, res, next) => {
  try {
    const { searchQuery = '', page = 1 } = req.query;
    const limit = 10; // Number of users per page
    const skip = (page - 1) * limit;

    const query = searchQuery
      ? { email: { $regex: searchQuery, $options: 'i' } }
      : {};

    const [users, totalUsers] = await Promise.all([
      User.find(query).limit(limit).skip(skip),
      User.countDocuments(query),
    ]);

    res.render('manage-users', {
      users,
      totalUsers,
      page: parseInt(page, 10),
      limit,
      searchQuery,
    });
  } catch (error) {
    next(error);
  }
});


// Get Single User
router.get('/user/:id', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const person = await User.findById(id);
    if (!person) {
      req.flash('error', 'User not found');
      return res.status(404).redirect('/admin/users');
    }
    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

// Add New User
router.post(
  '/add-user',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(Object.values(roles)).withMessage('Invalid role'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array().map((err) => err.msg).join(', '));
        return res.status(400).redirect('/admin/users');
      }

      const { email, password, role } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        req.flash('error', 'Email is already in use');
        return res.status(400).redirect('/admin/users');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword, role });
      await newUser.save();

      req.flash('info', `User ${email} created successfully`);
      res.redirect('/admin/users');
    } catch (error) {
      next(error);
    }
  }
);

// Update User Role
router.post('/update-role', validateObjectId, async (req, res, next) => {
  try {
    const { id, role } = req.body;

    if (!role || !Object.values(roles).includes(role)) {
      req.flash('error', 'Invalid role');
      return res.status(400).redirect('back');
    }

    if (req.user.id === id) {
      req.flash('error', 'Admins cannot demote themselves');
      return res.status(403).redirect('back');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      req.flash('error', 'User not found');
      return res.status(404).redirect('back');
    }

    req.flash('info', `Role for ${user.email} updated to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

// Delete User
router.post('/delete-user', validateObjectId, async (req, res, next) => {
  try {
    const { id } = req.body;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      req.flash('error', 'User not found');
      return res.status(404).redirect('/admin/users');
    }

    req.flash('info', `User ${user.email} deleted successfully`);
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
