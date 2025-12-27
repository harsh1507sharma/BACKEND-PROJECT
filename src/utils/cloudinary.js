

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();


// 🔥 FORCE Cloudinary to ignore any hidden URL
delete process.env.CLOUDINARY_URL;
console.log("🔥 Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.config({
  cloud_name: String(process.env.CLOUDINARY_CLOUD_NAME),
  api_key: String(process.env.CLOUDINARY_API_KEY),
  api_secret: String(process.env.CLOUDINARY_API_SECRET),
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const resolvedPath = path.resolve(localFilePath);

    const response = await cloudinary.uploader.upload(resolvedPath, {
      resource_type: "image",
    });

    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }

    console.log("✅ Uploaded to Cloudinary:", response.secure_url);
    return response;
  } catch (error) {
    console.error("🔥 FINAL Cloudinary error:", error);
    return null;
  }
};

export { uploadToCloudinary };
