const express = require("express");
const router = express.Router();
const controllers = require("../controllers/blog-post.controllers");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const userRoles = require("../config/userRoles.config");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");
const {
  createBlogPostValidation,
  updateBlogPostValidation,
  singleBlogPostValidation,
  deleteBlogPostValidation,
} = require("../../validations/blog-post.validation");

router.use(verifyToken);

router
  .route("/")
  .get(authorizedRole(...Object.values(userRoles)), controllers.getBlogPosts);
  router
  .route("/published")
  .get(authorizedRole(...Object.values(userRoles)), controllers.getPublishedBlogPosts);
  router
  .route("/draft")
  .get(authorizedRole(...Object.values(userRoles)), controllers.getDraftBlogPosts);

router
  .route("/create")
  .post(
    authorizedRole(userRoles.ADMIN, userRoles.MANAGER, userRoles.CSR),
    createBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.createBlogPost
  );

router
  .route("/:slug")
  .get(
    authorizedRole(...Object.values(userRoles)),
    singleBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.getBlogPost
  );

router
  .route("/:blogPostId")
  .patch(
    authorizedRole(userRoles.ADMIN, userRoles.MANAGER, userRoles.CSR),
    updateBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateBlogPost
  )
  .delete(
    authorizedRole(userRoles.ADMIN),
    deleteBlogPostValidation(),
    validationErrorHandlerMiddleware,
    controllers.deleteBlogPost
  );

module.exports = router;
