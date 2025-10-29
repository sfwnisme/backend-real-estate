const multer = require("multer");
const path = require("path");
const { FILES_CONFIGS } = require("../config/enum.config");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Invalid file type. Only images are allowed.");
    error.status = 400;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILES_CONFIGS.IMAGE.MAX_SIZE * 1024 * 1024 }, // limit 1MB per image file
});

module.exports = upload;
