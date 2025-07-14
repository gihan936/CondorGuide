import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import classroomRoutes from './routes/classroomRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import securityAlertRoutes from './routes/securityAlertRoutes.js';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import donationRoutes from './routes/donationRoutes.js';


// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Add a test route to check if files exist
app.get('/api/test-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  // Check if file exists
  import('fs').then(fs => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(404).json({ exists: false, path: filePath });
      } else {
        res.json({ exists: true, path: filePath });
      }
    });
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/security-alerts', securityAlertRoutes);
app.use('/api/donations', donationRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'uploads')}`);
});