import express from "express";
import IssueReport from "../models/IssueReport.js";
import upload from "../config/multerGridFS.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { protect } from "../middleware/auth.js";
import { getGridFSBucket } from "../config/gridfs.js";

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
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Upload middleware error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { title, description, category, subcategory, priority, location } =
      req.body;
    const userInfo = getUserInfo(req) || {};

    const newIssue = new IssueReport({
      title,
      description,
      category,
      subcategory,
      priority,
      location,
      reportedBy: userInfo.userId || null,
      image: req.file ? `${req.protocol}://${req.get("host")}/api/issues/image/${req.file.id}` : null,
    });

    await newIssue.save();

    res.status(201).json({ success: true, data: newIssue });
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

    const host = req.protocol + "://" + req.get("host");

    const formattedIssues = issues.map((issue) => ({
      ...issue.toObject(),
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

// Get image by id
router.get("/image/:id", (req, res) => {
  const bucket = getGridFSBucket();

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid image ID");
  }

  const downloadStream = bucket.openDownloadStream(
    new mongoose.Types.ObjectId(req.params.id)
  );

  downloadStream.on("error", () => res.status(404).send("Image not found"));
  downloadStream.pipe(res);
});

// Get issues for current user
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

// Update an issue (admin)
router.put("/update", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { issueId, status, priority, mainCategory, comment } = req.body;

    const issue = await IssueReport.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    if (status) issue.status = status;
    if (priority) issue.priority = priority;
    if (mainCategory) issue.mainCategory = mainCategory;

    if (comment) {
      issue.comments.push({
        admin: decoded.userId,
        comment: comment,
        timestamp: new Date(),
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

// Resolve an issue (user)
router.patch("/:id/resolve", protect, async (req, res) => {
  try {
    const issue = await IssueReport.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    if (issue.reportedBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to resolve this issue" });
    }

    issue.status = "Resolved";
    await issue.save();

    res.json({ success: true, data: issue });
  } catch (err) {
    console.error("Resolve error:", err);
    res.status(500).json({ success: false, message: "Failed to resolve issue" });
  }
});

export default router;
