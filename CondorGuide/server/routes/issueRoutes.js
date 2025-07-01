import express from 'express';
import IssueReport from '../models/IssueReport.js';
import upload from '../config/multerConfig.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to extract user info from token
const getUserInfo = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Report a new issue
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, subcategory, priority, location } = req.body;
    const userInfo = getUserInfo(req) || {};
    
    const newIssue = new IssueReport({
      title,
      description,
      category,
      subcategory,
      priority,
      location,
      image: req.file ? req.file.path : null,
      createdBy: userInfo.userId,
      userEmail: userInfo.email,
      userRole: userInfo.role
    });

    const savedIssue = await newIssue.save();
    
    res.status(201).json({
      success: true,
      data: savedIssue,
      message: 'Issue reported successfully'
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report issue',
      error: error.message
    });
  }
});

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await IssueReport.find().populate('createdBy', 'email role');
    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message
    });
  }
});

export default router;