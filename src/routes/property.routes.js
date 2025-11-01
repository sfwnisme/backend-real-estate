const express = require("express");
const router = express.Router();
const controllers = require("../controllers/property.controllers");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const { USER_ROLES } = require("../config/enum.config");
const {
  singlePropertyValidation,
  createPropertyValidation,
  updatePropertyValidation,
  deletePropertyValidation,
  updatePropertySlugValidation,
} = require("../validations/property.validation");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");

router.route("/").get(controllers.getProperties);

router
  .route("/create")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    createPropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.createProperty,
  );

router
  .route("/:slug")
  .get(
    singlePropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.getProperty,
  );

router
  .route("/update-slug")
  .patch(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    updatePropertySlugValidation(),
    validationErrorHandlerMiddleware,
    controllers.updatePropertySlug,
  );

router
  .route("/:propertyId")
  .patch(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    updatePropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateProperty,
  );

router
  .route("/delete/:propertyId")
  .delete(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    deletePropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.deleteProperty,
  );

module.exports = router;
