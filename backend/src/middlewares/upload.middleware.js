import multer from "multer";

// Use memory storage — the buffer is handed off directly to Cloudinary.
// This avoids writing to the local filesystem, which is ephemeral on Vercel
// and would produce dead links if served as a local URL.
const storage = multer.memoryStorage();

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
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});
