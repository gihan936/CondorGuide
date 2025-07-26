import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.ATLAS_URL;

if (!mongoURI) {
  throw new Error("ATLAS_URL environment variable is not set!");
}

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    console.log("File mimetype received:", file.mimetype);
    console.log("Is mimetype in allowed list?", allowedTypes.includes(file.mimetype));

    if (!allowedTypes.includes(file.mimetype)) {
      console.log("❌ Mimetype not allowed. Rejecting upload.");
      return Promise.reject(new Error("Invalid file type"));
    }

    console.log("✅ Mimetype allowed, proceeding to store.");
    return Promise.resolve({
      bucketName: "issueImages", // MUST match GridFSBucket name
      filename: `${Date.now()}-${file.originalname}`,
    });
  },
});

const upload = multer({ storage });

export default upload;
