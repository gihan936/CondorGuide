import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Classroom from './models/classroom.js';

dotenv.config();

mongoose.connect(process.env.ATLAS_URL)
  .then(async () => {
    console.log("Connected to DB");

    await Classroom.deleteMany();

    await Classroom.insertMany([
      {
        roomNumber: "A101",
        wing: "A Wing",
        bookings: [
          { date: "2025-06-04", from: "09:00", to: "10:00" }
        ]
      },
      {
        roomNumber: "A102",
        wing: "A Wing",
        bookings: []
      },
      {
        roomNumber: "B201",
        wing: "B Wing",
        bookings: []
      }
    ]);

    console.log("Seeded data.");
    process.exit();
  })
  .catch(err => console.error("DB error", err));
