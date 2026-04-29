import fs from "fs";
import path from "path";
import multer from "multer";

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_URL;
// On Vercel, the only writable directory is /tmp
const uploadsDir = isVercel 
  ? path.join('/tmp', 'uploads', 'proofs') 
  : path.resolve(process.cwd(), "uploads/proofs");

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.warn("Could not create uploads directory (expected on Vercel):", error.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}-${safeOriginal}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only png, jpg, webp, and pdf files are allowed"));
    return;
  }

  cb(null, true);
};

export const uploadProof = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
