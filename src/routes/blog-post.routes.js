const express = require("express");
const router = express.Router();
const controllers = require("../controllers/blog-post.controllers");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const { USER_ROLES } = require("../config/enum.config");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");
const {
  createBlogPostValidation,
  updateBlogPostValidation,
  singleBlogPostValidation,
  deleteBlogPostValidation,
  updateBlogPostSlugValidation,
} = require("../validations/blog-post.validation");

// router.use(verifyToken);

// router.route("/").get(controllers.getBlogPosts);
router.route("/").get(controllers.getPaginatedBlogPosts);
router.route("/published").get(controllers.getPublishedBlogPosts);
router
  .route("/draft")
  .get(
    verifyToken,
    authorizedRole(...Object.values(USER_ROLES)),
    controllers.getDraftBlogPosts,
  );

router
  .route("/create")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    createBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.createBlogPost,
  );

router
  .route("/:slug")
  .get(
    singleBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.getBlogPost,
  );

router
  .route("/update-slug")
  .patch(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    updateBlogPostSlugValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateBlogPostSlug,
  );

// delet this route, it's only for testing
// router
//   .route("/delete-many")
//   .delete(
//     verifyToken,
//     authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
//     updateBlogPostValidation(),
//     controllers.deleteManyBlogPosts,
//   );
//
router
  .route("/:blogPostId")
  .patch(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CONTENT),
    updateBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateBlogPost,
  );

router
  .route("/delete/:blogPostId")
  .delete(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    deleteBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.deleteBlogPost,
  );

module.exports = router;
