const express = require("express");
const router = express.Router();
const controllers = require("../controllers/user.controllers");
const {
  // loginValidation,
  // updateUserValidation,
  userRegisterValidation,
  userLoginValidation,
  userUpdateValidation,
  singleUserValidation,
  deleteUserValidation,
} = require("../validations/user.validation");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const { USER_ROLES } = require("../config/enum.config");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");

router
  .route("/")
  .get(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    controllers.getAllUsers,
  );

router.route("/me").get(verifyToken, controllers.getCurrentUser);

router
  .route("/register")
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    userRegisterValidation(),
    validationErrorHandlerMiddleware,
    controllers.register,
  );

router
  .route("/login")
  .post(
    userLoginValidation(),
    validationErrorHandlerMiddleware,
    controllers.login,
  );

router
  .route("/:userId")
  .get(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    singleUserValidation(),
    validationErrorHandlerMiddleware,
    controllers.getSingleUser,
  )
  .patch(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    userUpdateValidation(),
    validationErrorHandlerMiddleware,
    controllers.updateUser,
  );
router
  .route("/delete/:userId")
  .delete(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN),
    deleteUserValidation(),
    validationErrorHandlerMiddleware,
    controllers.deleteUser,
  );

module.exports = router;
