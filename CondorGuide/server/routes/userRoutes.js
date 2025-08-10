import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../config/emailConfig.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

//register
router.post('/signUp', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields (email, password, firstName, lastName) are required' });
    }

    // Check if user with email already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Check if firstName or lastName already exists
    const nameExist = await User.findOne({
      $or: [
        { firstName: { $regex: new RegExp(`^${firstName}$`, 'i') } },
        { lastName: { $regex: new RegExp(`^${lastName}$`, 'i') } }
      ]
    });
    if (nameExist) {
      return res.status(409).json({ message: 'A user with this first name or lastName already exists' });
    }

    // Create new user
    const newUser = new User({ email, password, firstName, lastName });
    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registered successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email, password});
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status === 'disable') {
      return res.status(401).json({ message: 'user disabled by admin' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Update role
router.put('/update-role', async (req, res) => {
  const { email, role } = req.body;

  await User.updateOne({ email }, { $set: { role } });
  res.json({ success: true });
});

// List users
router.get('/users', async (req, res) => {
  const users = await User.find({}, 'email role status');
  res.json(users);
});

// Get user info by email
router.get('/info', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error('Fetch user by email error:', err);
    res.status(500).json({ message: 'Failed to fetch user.', error: err.message });
  }
});

// Change Password
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (currentPassword !== user.password) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password.', error: err.message });
  }
});

// Update Profile
router.put('/update-profile', async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      department,
      employeeId,
      userType,
      bio
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.department = department || user.department;
    user.employeeId = employeeId || user.employeeId;
    user.userType = userType || user.userType;
    user.bio = bio || user.bio;

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        department: user.department,
        employeeId: user.employeeId,
        userType: user.userType,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Profile update failed.', error: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email.' });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    await user.save();
    await sendEmail(
      user.email,
      "Reset Your Password",
      `<p>Your password reset code is: ${resetCode}.</p><p> This code will expire in 15 minutes.</p><p>If you did not request a password reset, please ignore this email.</p>`
    );
    res.status(200).json({ message: 'Reset code sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || user.resetCode !== resetCode) {
      return res.status(400).json({ message: 'Invalid reset code or email.' });
    }
    if (Date.now() > user.resetCodeExpires) {
      return res.status(400).json({ message: 'Reset code has expired.' });
    }

    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'Password has been reset successfully.' });
    await sendEmail(
      user.email,
      "Reset Your Password",
      `<p>Your Password for CondorGuide has been reset at ${new Date().toLocaleString()}</p>`
    );
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot change status of superadmin account.' });
    }

    // Toggle status between 'enable' and 'disable'
    const newStatus = user.status === 'enable' ? 'disable' : 'enable';
    user.status = newStatus;

    await user.save();

    res.status(200).json({ message: `User status changed to ${newStatus}.` });
  } catch (err) {
    console.error('Toggle user status error:', err);
    res.status(500).json({ message: 'Failed to toggle user status.', error: err.message });
  }
});

export default router;