import express from 'express';
import User from '../models/User.js';
const router = express.Router();

// user signUp
router.post('/signUp', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'All fields are required' })
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(409).json({ message: 'user already exist' })
    }
    const newUser = new User({ email, password });
    await newUser.save();

    res.status(200).json({ message: 'registered successfully' })

})

//  user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }
        res.status(200).json({ message: 'Login successful', user })
    } catch (error) {
        res.status(500).json({ message: "Error in logging user", error });
    }
});

export default router;

