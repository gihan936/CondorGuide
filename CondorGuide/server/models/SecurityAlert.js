import mongoose from 'mongoose';

const securityAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  emergencyType: { type: String, enum: ['critical', 'non-critical'], required: true },
  category: { type: String, default: null },
  isPicked: { type: Boolean, default: false },
  pickedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  pickedByName: { type: String, default: null },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('SecurityAlert', securityAlertSchema);
