const { body, param } = require("express-validator");
const { USER_ROLES } = require("../config/enum.config");

const registerValidation = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("name should not be empty")
      .isLength({ min: 3, max: 20 })
      .withMessage("charachters should be 3 to 20"),
    body("email")
      .notEmpty()
      .withMessage("email should not be empty")
      .isEmail()
      .withMessage("should be a valid email"),
    body("password").notEmpty().withMessage("password should not be empty"),
  ];
};

const loginValidation = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("⚠️ Email cannot be empty. Please enter your email address.")
      .isEmail()
      .withMessage(
        "⚠️ Invalid email format. Please enter a valid email address (e.g., user@example.com)."
      ),

    body("password")
      .notEmpty()
      .withMessage("⚠️ Password cannot be empty. Please enter your password."),
  ];
};

const updateUserValidation = () => {
  return [
    param("id")
      .optional()
      .isMongoId()
      .withMessage("ID is not valid mongodb ObjectId"),
    body("name")
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage("charachters should be 3 to 20"),
    body("email").optional().isEmail().withMessage("should be a valid email"),
    body("role")
      .optional()
      .isIn(Object.values(USER_ROLES))
      .withMessage(`available roles: ${Object.values(USER_ROLES)}`),
  ];
};

module.exports = { registerValidation, loginValidation, updateUserValidation };
