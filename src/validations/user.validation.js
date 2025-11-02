const { body, param } = require("express-validator");
const { USER_ROLES } = require("../config/enum.config");
const { documentExists } = require("./validatorHelpers");
const User = require("../models/user.model");
// const BlogPost = require("../models/blog-post.model");

const userValidation = module.exports;

userValidation.userRegisterValidation = () => {
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
      .withMessage("should be a valid email")
      .custom(async (value) => documentExists("email", value, User, true))
      .withMessage("user already exist, try another email"),
    body("password").notEmpty().withMessage("password should not be empty"),
    body("role")
      .notEmpty()
      .withMessage("please enter the user role")
      .isIn(Object.values(USER_ROLES))
      .withMessage(
        "user role is undefined please choose one of the following roles " +
        Object.values(USER_ROLES).join(", "),
      ),
  ];
};

userValidation.userLoginValidation = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email cannot be empty. Please enter your email address.")
      .isEmail()
      .withMessage(
        "Invalid email format. Please enter a valid email address (e.g., user@example.com).",
      )
      .custom(async (value) => documentExists("email", value, User, false))
      .withMessage("User does not exist"),

    body("password")
      .notEmpty()
      .withMessage("Password cannot be empty. Please enter your password."),
  ];
};

userValidation.userUpdateValidation = () => {
  return [
    param("userId")
      .notEmpty()
      .isMongoId()
      .withMessage("ID is not valid mongodb ObjectId")
      .bail()
      .custom(async (value) => documentExists("_id", value, User, false))
      .withMessage("User does not exist"),
    body("name")
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage("charachters should be 3 to 20"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("should be a valid email")
      .custom(async (value, { req }) => {
        const userId = req.params.userId;
        const email = value;
        const findExistEmail = await User.findOne({
          _id: { $ne: userId },
          email,
        });
        if (findExistEmail) {
          throw new Error("USER ALREADY EXIST");
        }
        return true;
      }),
    body("role")
      .optional()
      .isIn(Object.values(USER_ROLES))
      .withMessage(`available roles: ${Object.values(USER_ROLES)}`),
  ];
};

userValidation.singleUserValidation = () => {
  return [
    param("userId")
      .isMongoId()
      .withMessage("is not mongoId")
      .custom(async (value) => documentExists("_id", value, User, false))
      .withMessage("user is not exist"),
  ];
};

userValidation.deleteUserValidation = () => {
  return [
    param("userId")
      .isMongoId()
      .withMessage("is not mongoId")
      .custom(async (value) => documentExists("_id", value, User, false))
      .withMessage("user is not exist"),
  ];
};
