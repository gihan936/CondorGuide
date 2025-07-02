import express from "express";
import IssueReport from "../models/IssueReport.js";
import upload from "../config/multerConfig.js";
import jwt from "jsonwebtoken";

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
      createdBy: userInfo.userId,
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
router.get("/", async (req, res) => {
  try {
    const issues = await IssueReport.find().populate("createdBy", "email role");
    
    // Log image paths for debugging
    issues.forEach(issue => {
      if (issue.image) {
        console.log(`Issue ${issue._id} image path:`, issue.image);
      }
    });
    
    res.json({
      success: true,
      data: issues,
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
    const issues = await IssueReport.find({ createdBy: decoded.userId }).sort({
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

export default router;