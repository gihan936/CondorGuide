import express from "express";
import IssueReport from "../models/IssueReport.js";
import upload from "../config/multerConfig.js";
import jwt from "jsonwebtoken";
import { protect } from '../middleware/auth.js';


const router = express.Router();

// Middleware to extract user info from token
const getUserInfo = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Report a new issue
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { title, description, category, subcategory, priority, location } =
              req.body;
                  const userInfo = getUserInfo(req) || {};

                      let imagePath = null;
                          if (req.file) {
                                // Store just the relative path from uploads folder
                                      imagePath = `uploads/${req.file.filename}`;
                                            console.log("File uploaded:", req.file);
                                                  console.log("Image path stored:", imagePath);
                                                      }

                                                          const newIssue = new IssueReport({
                                                                title,
                                                                      description,
                                                                            category,
                                                                                  subcategory,
                                                                                        priority,
                                                                                              location,
                                                                                                    image: imagePath,
                                                                                                          reportedBy: userInfo.userId,
                                                                                                                userEmail: userInfo.email,
                                                                                                                      userRole: userInfo.role,
                                                                                                                          });

                                                                                                                              const savedIssue = await newIssue.save();
                                                                                                                                  console.log("Issue saved with image path:", savedIssue.image);

                                                                                                                                      res.status(201).json({
                                                                                                                                            success: true,
                                                                                                                                                  data: savedIssue,
                                                                                                                                                        message: "Issue reported successfully",
                                                                                                                                                            });
                                                                                                                                                              } catch (error) {
                                                                                                                                                                  console.error("Error reporting issue:", error);
                                                                                                                                                                      res.status(500).json({
                                                                                                                                                                            success: false,
                                                                                                                                                                                  message: "Failed to report issue",
                                                                                                                                                                                        error: error.message,
                                                                                                                                                                                            });
                                                                                                                                                                                              }
                                                                                                                                                                                              });

// Get all issues
router.get("/all", async (req, res) => {
  try {
    const issues = await IssueReport.find().populate("reportedBy", "email role");

    // Log image paths for debugging
    issues.forEach(issue => {
      if (issue.image) {
        console.log(`Issue ${issue._id} image path:`, issue.image);
      }
    });

    const host = req.protocol + "://" + req.get("host");

    const formattedIssues = issues.map((issue) => ({
      ...issue.toObject(),
      image: issue.image ? `${host}/${issue.image}` : null,
    }));

    res.json({
      success: true,
      data: formattedIssues,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
});

// Get issues for the current user
router.get("/user", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const issues = await IssueReport.find({ reportedBy: decoded.userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error("Error fetching user issues:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user issues",
      error: error.message,
    });
  }
});

router.put('/update', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { issueId, status, priority, mainCategory, comment } = req.body;

    const issue = await IssueReport.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Apply updates
    if (status) issue.status = status;
    if (priority) issue.priority = priority;
    if (mainCategory) issue.mainCategory = mainCategory;

    // Add admin comment if provided
    if (comment) {
      issue.comments.push({
        admin: decoded.userId,
        comment: comment,
        timestamp: new Date()
      });
    }

    const updatedIssue = await issue.save();

    res.json({ success: true, data: updatedIssue });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update issue",
      error: error.message,
    });
  }
});

router.patch('/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await SecurityAlert.findById(req.params.id);

    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    // Ensure the user resolving it is the one who created it
    if (alert.userId !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized to resolve this alert' });

    alert.resolved = true;
    await alert.save();

    res.json({ success: true, alert });
  } catch (err) {
    console.error('Resolve error:', err);
    res.status(500).json({ message: 'Failed to resolve alert' });
  }
});


export default router;