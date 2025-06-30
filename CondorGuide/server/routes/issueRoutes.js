import multer from 'multer';
import path from 'path';
import Issue from '../models/issue.js';
import express from 'express';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads')); // absolute path inside your project folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// POST route to create a new issue
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, subcategory, priority } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const newIssue = new Issue({
      title,
      description,
      mainCategory: category,
      subCategory: subcategory,
      priority,
      imageUrl: image,
      reportedBy: req.user ? req.user._id : null,
    });

    await newIssue.save();
    res.status(201).json({ message: 'Issue created successfully' });
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET route to return all issues
router.get('/all', async (req, res) => {
  try {
    const issues = await Issue.find().populate('reportedBy', 'name email').populate('comments.admin', 'name email').sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
