const { body } = require("express-validator");
const { documentExists } = require("./validatorHelpers");
const Property = require("../models/property.model");
const Image = require("../models/image.model");

const imageValidation = module.exports;

imageValidation.imageTempIdValidation = () => {
  return [
    body("tempId")
      .isMongoId()
      .withMessage(`${"tempId"} must be a valid mongoId`),
  ];
};
imageValidation.ownerImageValidation = (field, ownerModel) => {
  return [
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`)
      .isMongoId()
      .withMessage(`${field} must be a valid mongoId`)
      .custom(async (value) => documentExists("_id", value, ownerModel, false))
      .withMessage(`${field} does not exist`),
    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage(`${"isFeatured"} must be a boolean`),
  ];
};

imageValidation.makeImageFeaturedValidation = () => {
  return [
    body("imageId")
      .trim()
      .notEmpty()
      .withMessage(`${"imageId"} is required`)
      .isMongoId()
      .withMessage(`${"imageId"} must be a valid mongoId`)
      .custom(async (value) => documentExists("_id", value, Image, false))
      .withMessage(`${"imageId"} does not exist`),
    body("ownerId")
      .notEmpty()
      .withMessage(`${"ownerId"} is required`)
      .bail()
      .isMongoId()
      .withMessage(`${"ownerId"} must be a valid mongoId`)
      .bail()
      .custom(async (value) => documentExists("_id", value, Property, false))
      .withMessage(`${"ownerId"} does not exist`),
  ];
};
