const multer = require("multer");
const { FILES_CONFIGS, IMAGE_ROLE_CONSTRAINTS } = require("../config/enum.config");

const multerMiddleware = module.exports;

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

multerMiddleware.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILES_CONFIGS.IMAGE.MAX_SIZE * 1024 * 1024 },
});

multerMiddleware.createRoleUpload = (role) => {
  const constraints = IMAGE_ROLE_CONSTRAINTS[role];
  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (!constraints.mimeTypes.includes(file.mimetype)) {
        const error = new Error(
          `Invalid file type for ${role}. Allowed: ${constraints.mimeTypes.join(", ")}`
        );
        error.status = 400;
        return cb(error);
      }
      cb(null, true);
    },
    limits: { fileSize: constraints.maxFileSize * 1024 * 1024 },
  });
};
