import { v2 as cloudinary } from "cloudinary";

let configured = false;

const getCloudinary = () => {
  if (configured) return cloudinary;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("[Cloudinary] Missing credentials — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
  return cloudinary;
};

/**
 * Uploads an in-memory file buffer directly to Cloudinary.
 * Returns the permanent secure_url (CDN link) and public_id.
 *
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} filename - Original filename (for naming)
 * @param {string} folder - Cloudinary folder (default: "golf-draw/proofs")
 * @returns {Promise<{ url: string; publicId: string }>}
 */
export const uploadToCloudinary = (buffer, filename, folder = "golf-draw/proofs") => {
  const client = getCloudinary();

  if (!client) {
    throw new Error("Cloudinary is not configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env");
  }

  return new Promise((resolve, reject) => {
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const baseName = safeFilename.replace(/\.[^.]+$/, "");
    const publicId = `${folder}/${Date.now()}-${baseName}`;

    const uploadStream = client.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "auto",   // handles images AND pdfs
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    uploadStream.end(buffer);
  });
};
