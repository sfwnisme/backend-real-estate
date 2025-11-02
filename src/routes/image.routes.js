const express = require("express");
const router = express.Router();
const controllers = require("../controllers/image.controllers");
const upload = require("../middlewares/multer.middleware");
const Property = require("../models/property.model.js");
const BlogPost = require("../models/blog-post.model.js");
const { FILES_CONFIGS, USER_ROLES, MODELS } = require("../config/enum.config");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");
const {
  imageTempIdValidation,
  imageOwnerIdImageValidation,
} = require("../validations/image.validation");

router.route("/").get(controllers.getImages);
router.route("/:imageId").get(controllers.getImage);
router
  .route("/create")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    upload.single("file"),
    controllers.createImage,
  );
router
  .route("/create-bulk")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    upload.array("files", FILES_CONFIGS.IMAGE.MAX_LENGTH),
    controllers.createImages,
  );

router
  .route("/delete/:imageId")
  .delete(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    controllers.deleteImage,
  );

// other routes
router.route("/property/:propertyId").get(controllers.getPropertyImages);

router
  .route("/create-temp-property-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    upload.single("file"),
    imageTempIdValidation(),
    validationErrorHandlerMiddleware,
    controllers.createTempPropertyImage,
  );
router
  .route("/create-property-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    upload.single("file"),
    imageOwnerIdImageValidation("propertyId", Property),
    validationErrorHandlerMiddleware,
    controllers.createPropertyImage,
  );

// blog-post images
router.route("/blog-post/:blogPostId").get(controllers.getBlogPostImage);
router
  .route("/create-temp-blog-post-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    upload.single("file"),
    imageTempIdValidation(),
    validationErrorHandlerMiddleware,
    controllers.createTempBlogPostImage,
  );
router
  .route("/create-blog-post-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    upload.single("file"),
    imageOwnerIdImageValidation("blogPostId", BlogPost),
    validationErrorHandlerMiddleware,
    controllers.createBlogPostImage,
  );

module.exports = router;
