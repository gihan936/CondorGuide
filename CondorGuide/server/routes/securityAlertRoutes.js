import Issue from '../models/issue.js';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {

    res.status(201).json({ message: 'Issue created successfully' });
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
