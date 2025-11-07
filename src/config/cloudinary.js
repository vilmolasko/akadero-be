const cloudinary = require("cloudinary").v2;

async function configureCloudinary() {
  const cloud = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_PUBLISHABLE_KEY,
    apiSecret: process.env.CLOUDINARY_SECRET_KEY,
    preset: process.env.CLOUDINARY_UPLOAD_PRESET,
  };

  cloudinary.config({
    cloud_name: cloud.cloudName,
    api_key: cloud.apiKey,
    api_secret: cloud.apiSecret,
    secure: true,
  });

  return cloud;
}

module.exports = { cloudinary, configureCloudinary };
