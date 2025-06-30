import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  mainCategory: {
    type: String,
    required: true,
    enum: [
      'Facilities & Maintenance',
      'Lighting & Electrical',
      'HVAC & Air Quality',
      'Safety & Accessibility',
      'Cleanliness & Sanitation',
    ],
  },
  subCategory: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
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

export default mongoose.model('Issue', issueSchema);
