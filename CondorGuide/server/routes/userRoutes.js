import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

// Register
router.post('/signUp', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registered successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role
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

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
  const users = await User.find({}, 'email role');
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

router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Compare current password
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

export default router;
