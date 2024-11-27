const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');
const bcrypt = require('bcrypt');

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

// Add New User Route
router.post('/add-user', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      req.flash('error', 'All fields are required');
      return res.redirect('/admin/users');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email already in use');
      return res.redirect('/admin/users');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    req.flash('info', `User ${email} created successfully`);
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});
router.get('/users', async (req, res, next) => {
  const { searchQuery } = req.query;
  let users;
  if (searchQuery) {
    users = await User.find({
      email: { $regex: searchQuery, $options: 'i' }
    });
  } else {
    users = await User.find();
  }
  res.render('manage-users', { users });
});


router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Checking for id and roles in req.body
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    req.flash('info', `updated role for ${user.email} to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});
// Delete User Route
router.post('/delete-user', async (req, res, next) => {
  try {
    const { id } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid user ID');
      return res.redirect('/admin/users');
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    req.flash('info', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});


module.exports = router;
