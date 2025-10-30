const express = require("express");
const router = express.Router();
const controllers = require("../controllers/image.controllers");
const fileUpload = require("express-fileupload");
const upload = require("../middlewares/multer.middleware");
const { FILES_CONFIGS } = require("../config/enum.config");

router.route("/").get(controllers.getImages);
router.route("/:imageId").get(controllers.getImage);
router.route("/create").post(upload.single("file"), controllers.createImage);
router
  .route("/create-bulk")
  .post(
    upload.array("files", FILES_CONFIGS.IMAGE.MAX_LENGTH),
    controllers.createImages
  ); 
// change it to :id for the frontend
router.route("/delete/:imageId").delete(controllers.deleteImage);

// other routes
router.route("/property/:propertyId").get(controllers.getPropertyImages);
router.route("/create-temp-property-image").post(upload.single("file"), controllers.createTempPropertyImage);
router.route("/create-property-image").post(upload.single("file"), controllers.createPropertyImage);

router.route("/blog-post/:blogPostId").get(controllers.getBlogPostImage);
router.route("/create-temp-blog-post-image").post(upload.single("file"), controllers.createTempBlogPostImage);
router.route("/create-blog-post-image").post(upload.single("file"), controllers.createBlogPostImage);


module.exports = router;
