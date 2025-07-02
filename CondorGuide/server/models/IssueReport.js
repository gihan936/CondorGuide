import mongoose from 'mongoose';

const issueReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // now optional
    default: null,
  },
  comments: [
    {
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming admins are also in the User model
        required: true,
      },
      comment: {
        type: String,
        required: true,
        trim: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const IssueReport = mongoose.model('IssueReport', issueReportSchema);

export default IssueReport;