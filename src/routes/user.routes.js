const express = require("express");
const router = express.Router();
const controllers = require("../controllers/user.controllers");
const {
  registerValidation,
  loginValidation,
  updateUserValidation,
} = require("../middlewares/validationSchema");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const { USER_ROLES } = require("../config/enum.config");

router.use(verifyToken);

router
  .route("/")
  .get(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    controllers.getAllUsers,
  );

router.route("/me").get(controllers.getCurrentUser);

router
  .route("/register")
  .post(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    registerValidation(),
    controllers.register,
  );

router.route("/login").post(loginValidation(), controllers.login);

router
  .route("/:userId")
  .get(controllers.getSingleUser)
  .patch(
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    updateUserValidation(),
    controllers.updateUser,
  )
  .delete(authorizedRole(USER_ROLES.ADMIN), controllers.deleteUser);

module.exports = router;
