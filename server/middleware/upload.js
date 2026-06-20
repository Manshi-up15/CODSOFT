import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials are provided in env
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer storage: Use memory storage so we get file buffers to either write locally or upload to Cloudinary
const storage = multer.memoryStorage();

// Accept jpeg, jpg, png, webp formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Unsupported file type. Allowed formats: PNG, JPG, JPEG, WEBP"));
};

// Limit file size to 5MB, max 5 images
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// Middleware helper to handle array of images
// We accept field name 'images' or 'images[]'
const uploadMiddleware = upload.any();

export const handleImageUpload = (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Maximum size allowed is 5MB." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message });
    }

    try {
      const files = req.files || [];
      const imageFields = files.filter(
        (f) => f.fieldname === "images" || f.fieldname === "images[]"
      );

      if (imageFields.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed." });
      }

      const imageUrls = [];

      for (const file of imageFields) {
        if (isCloudinaryConfigured) {
          // Upload to Cloudinary
          const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "shopsphere_products" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.write(file.buffer);
            stream.end();
          });
          const url = await uploadPromise;
          imageUrls.push(url);
        } else {
          // Fallback to local server storage
          const uploadsDir = path.join(__dirname, "../uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, file.buffer);

          // Construct relative static path URL
          const relativeUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
          imageUrls.push(relativeUrl);
        }
      }

      // Attach uploaded URLs to req
      req.uploadedImageUrls = imageUrls;
      next();
    } catch (uploadError) {
      console.error("Image upload processing error:", uploadError);
      return res.status(500).json({ message: "Failed to process and store product images." });
    }
  });
};

export const handleCategoryImageUpload = (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Maximum size allowed is 5MB." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message });
    }

    try {
      const files = req.files || [];
      const imageFile = files.find((f) => f.fieldname === "image");

      if (imageFile) {
        if (isCloudinaryConfigured) {
          const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "shopsphere_categories" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.write(imageFile.buffer);
            stream.end();
          });
          req.uploadedCategoryImageUrl = await uploadPromise;
        } else {
          const uploadsDir = path.join(__dirname, "../uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(imageFile.originalname)}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, imageFile.buffer);

          req.uploadedCategoryImageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
        }
      }
      next();
    } catch (uploadError) {
      console.error("Category image upload processing error:", uploadError);
      return res.status(500).json({ message: "Failed to process and store category image." });
    }
  });
};
