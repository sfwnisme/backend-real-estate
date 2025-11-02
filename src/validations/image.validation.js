const { body } = require("express-validator");
const { documentExists } = require("./validatorHelpers");

const imageValidation = module.exports;

imageValidation.imageTempIdValidation = () => {
  return [
    body("tempId")
      .isMongoId()
      .withMessage(`${"tempId"} must be a valid mongoId`),
  ];
};
imageValidation.imageOwnerIdImageValidation = (field, ownerModel) => {
  return [
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`)
      .isMongoId()
      .withMessage(`${field} must be a valid mongoId`)
      .custom(async (value) => documentExists("_id", value, ownerModel, false))
      .withMessage(`${field} does not exist`),
  ];
};
