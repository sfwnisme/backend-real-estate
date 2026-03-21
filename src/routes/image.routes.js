const express = require("express");
const router = express.Router();
const controllers = require("../controllers/image.controllers");
const multerMiddleware = require("../middlewares/multer.middleware");
const Property = require("../models/property.model.js");
const BlogPost = require("../models/blog-post.model.js");
const {
  FILES_CONFIGS,
  USER_ROLES,
  IMAGE_ROLES,
  IMAGE_TAGS,
} = require("../config/enum.config");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");
const {
  imageTempIdValidation,
  ownerImageValidation,
  makeImageFeaturedValidation,
  siteInfoImageCreateValidation,
  getImageValidation,
} = require("../validations/image.validation");

const injectSiteInfoMeta = (role, tag) => (req, res, next) => {
  req.siteInfoImageMeta = { role, tag, alt: req.body.alt ?? null };
  next();
};

router.route("/").get(controllers.getImages);
router
  .route("/create")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware.upload.single("file"),
    controllers.createImage,
  );
router
  .route("/create-bulk")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware.upload.array("files", FILES_CONFIGS.IMAGE.MAX_LENGTH),
    controllers.createImages,
  );

router
  .route("/make-image-featured")
  .patch(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    makeImageFeaturedValidation(),
    validationErrorHandlerMiddleware,
    controllers.makeImageFeatured,
  );

router
  .route("/delete/temp-images")
  .delete(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    controllers.deleteTempImages,
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
    multerMiddleware.upload.single("file"),
    imageTempIdValidation(),
    validationErrorHandlerMiddleware,
    controllers.createTempPropertyImage,
  );
router
  .route("/create-property-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware.upload.single("file"),
    ownerImageValidation("propertyId", Property),
    validationErrorHandlerMiddleware,
    controllers.createPropertyImage,
  );

// site-info images
router.route("/site-info").get(
  getImageValidation(),
  validationErrorHandlerMiddleware,
  controllers.getSiteInfoImages
);

router
  .route("/create-site-info-icon-dark")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware
      .createRoleUpload(IMAGE_ROLES.SITE_INFO.ICON)
      .single("file"),
    injectSiteInfoMeta(IMAGE_ROLES.SITE_INFO.ICON, IMAGE_TAGS.THEME_DARK),
    siteInfoImageCreateValidation(),
    validationErrorHandlerMiddleware,
    controllers.createSiteInfoImage,
  );

router
  .route("/create-site-info-icon")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware
      .createRoleUpload(IMAGE_ROLES.SITE_INFO.ICON)
      .single("file"),
    injectSiteInfoMeta(IMAGE_ROLES.SITE_INFO.ICON, IMAGE_TAGS.THEME_DEFAULT),
    siteInfoImageCreateValidation(),
    validationErrorHandlerMiddleware,
    controllers.createSiteInfoImage,
  );

router
  .route("/create-site-info-logo-dark")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware
      .createRoleUpload(IMAGE_ROLES.SITE_INFO.LOGO)
      .single("file"),
    injectSiteInfoMeta(IMAGE_ROLES.SITE_INFO.LOGO, IMAGE_TAGS.THEME_DARK),
    siteInfoImageCreateValidation(),
    validationErrorHandlerMiddleware,
    controllers.createSiteInfoImage,
  );

router
  .route("/create-site-info-logo")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware
      .createRoleUpload(IMAGE_ROLES.SITE_INFO.LOGO)
      .single("file"),
    injectSiteInfoMeta(IMAGE_ROLES.SITE_INFO.LOGO, IMAGE_TAGS.THEME_DEFAULT),
    siteInfoImageCreateValidation(),
    validationErrorHandlerMiddleware,
    controllers.createSiteInfoImage,
  );

router
  .route("/create-site-info-og-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    multerMiddleware
      .createRoleUpload(IMAGE_ROLES.SITE_INFO.OG_IMAGE)
      .single("file"),
    injectSiteInfoMeta(IMAGE_ROLES.SITE_INFO.OG_IMAGE, null),
    siteInfoImageCreateValidation(),
    validationErrorHandlerMiddleware,
    controllers.createSiteInfoImage,
  );

// blog-post images
router.route("/blog-post/:blogPostId").get(controllers.getBlogPostImage);
router
  .route("/create-temp-blog-post-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    multerMiddleware.upload.single("file"),
    imageTempIdValidation(),
    validationErrorHandlerMiddleware,
    controllers.createTempBlogPostImage,
  );
router
  .route("/create-blog-post-image")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    multerMiddleware.upload.single("file"),
    ownerImageValidation("blogPostId", BlogPost),
    validationErrorHandlerMiddleware,
    controllers.createBlogPostImage,
  );

// get image by id, added here to avoid the conflict with
// the get image by id route in the property routes
router.route("/:imageId").get(controllers.getImage);

module.exports = router;
