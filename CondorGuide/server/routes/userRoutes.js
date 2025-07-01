import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
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
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.put('/update-role', async (req, res) => {
  const { email, role } = req.body;

  await User.updateOne({ email }, { $set: { role } });
  res.json({ success: true });
});

router.get('/users', async (req, res) => {
  const users = await User.find({}, 'email role'); // protect sensitive info
  res.json(users);
});



export default router;

