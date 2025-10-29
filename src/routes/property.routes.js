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
} = require("../validations/property.validation");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");

router.use(verifyToken);

router
  .route("/")
  .get(authorizedRole(...Object.values(USER_ROLES)), controllers.getProperties);

router
  .route("/create")
  .post(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CSR),
    createPropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.createProperty
  );

router
  .route("/:slug")
  .get(
    authorizedRole(...Object.values(USER_ROLES)),
    singlePropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.getProperty
  );
router
  .route("/:propertyId")
  .patch(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CSR),
    updatePropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateProperty
  )
  .delete(
    authorizedRole(USER_ROLES.ADMIN),
    deletePropertyValidation(),
    validationErrorHandlerMiddleware,
    controllers.deleteProperty
  );

module.exports = router;
