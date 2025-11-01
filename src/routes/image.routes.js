const express = require("express");
const router = express.Router();
const controllers = require("../controllers/image.controllers");
const upload = require("../middlewares/multer.middleware");
const { FILES_CONFIGS, USER_ROLES } = require("../config/enum.config");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");

router.route("/").get(controllers.getImages);
router.route("/:imageId").get(controllers.getImage);
router
  .route("/create")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    upload.single("file"),
    controllers.createImage,
  );
router
  .route("/create-bulk")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    upload.array("files", FILES_CONFIGS.IMAGE.MAX_LENGTH),
    controllers.createImages,
  );

router
  .route("/delete/:imageId")
  .delete(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
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
    controllers.createTempPropertyImage,
  );
router
  .route("/create-property-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    upload.single("file"),
    controllers.createPropertyImage,
  );

// blog-post images
router.route("/blog-post/:blogPostId").get(controllers.getBlogPostImage);
router
  .route("/create-temp-blog-post-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    upload.single("file"),
    controllers.createTempBlogPostImage,
  );
router
  .route("/create-blog-post-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    upload.single("file"),
    controllers.createBlogPostImage,
  );

module.exports = router;
