import express from 'express';
import IssueReport from '../models/IssueReport.js';
import upload from '../config/multerConfig.js';


const router = express.Router();

// Report a new issue (without auth middleware)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, subcategory, priority, location } = req.body;
    
    const newIssue = new IssueReport({
      title,
      description,
      category,
      subcategory,
      priority,
      location,
      image: req.file ? req.file.path : null
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

// Get all issues (without auth)
router.get('/', async (req, res) => {
  try {
    const issues = await IssueReport.find();
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