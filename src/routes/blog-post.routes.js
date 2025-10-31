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

router.use(verifyToken);

router
  .route("/")
  .get(authorizedRole(...Object.values(USER_ROLES)), controllers.getBlogPosts);
router
  .route("/published")
  .get(
    authorizedRole(...Object.values(USER_ROLES)),
    controllers.getPublishedBlogPosts
  );
router
  .route("/draft")
  .get(
    authorizedRole(...Object.values(USER_ROLES)),
    controllers.getDraftBlogPosts
  );

router
  .route("/create")
  .post(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CSR),
    createBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.createBlogPost
  );

router
  .route("/:slug")
  .get(
    authorizedRole(...Object.values(USER_ROLES)),
    singleBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.getBlogPost
  );

router
  .route("/update-slug")
  .patch(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CSR),
    updateBlogPostSlugValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateBlogPostSlug
  );

// delet this route, it's only for testing
router.route("/delete-many").delete(controllers.deleteManyBlogPosts);

router
  .route("/:blogPostId")
  .patch(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CSR),
    updateBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateBlogPost
  )
  .delete(
    authorizedRole(USER_ROLES.ADMIN),
    deleteBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.deleteBlogPost
  );

module.exports = router;
