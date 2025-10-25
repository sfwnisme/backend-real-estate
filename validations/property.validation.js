const { param, check, body } = require("express-validator");
const Property = require("../src/models/property.model");
const {
  mustBeNumberMsg,
  checkPropertyTitleUniqueOnUpdate,
} = require("../src/utils/validation.utils");
const { PROPERTY_TYPE, PROPERTY_STATUS } = require("../src/config/enum.config");
const {
  isValidateYearBuilt,
  documentExists,
  checkObjectId,
  checkDocumentTitleUniqueOnUpdate,
  checkSingleRequestByParam,
} = require("./validatorHelpers");

const propertyValidation = module.exports;

propertyValidation.createPropertyValidation = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("property cannot be empty")
      .isLength({ min: 3, max: 120 })
      .withMessage(
        (value) =>
          `"${value}" property name length should contain 15 to 120 charachters`
      )
      .custom(async (value) => documentExists("title", value, Property, true))
      .withMessage(
        (value) =>
          `"${value}" property name is already taken, choose another one`
      ),
    body("description")
      .notEmpty()
      .withMessage("description can not be empty")
      .isLength({ min: 15 })
      .withMessage(
        (value) =>
          `"${value}" property description length should contain 15 charachters at least`
      ),
    body("price")
      .notEmpty()
      .isNumeric()
      .withMessage((value) => `${value} price must be a number`),
    body("propertySize")
      .notEmpty()
      .withMessage("property size should not be empty")
      .isNumeric()
      .withMessage(mustBeNumberMsg),
    body("bedrooms").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("bathrooms").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("garage").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("garageSize").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("yearBuilt")
      .notEmpty()
      .withMessage("year built should not be empty")
      .isNumeric() // BUG:if the value is string number like "2001", it will pass
      .withMessage((value) => `${value} must be a number`)
      .custom(isValidateYearBuilt),
    body("propertyType")
      .notEmpty()
      .isIn(Object.values(PROPERTY_TYPE))
      .withMessage(
        (value) =>
          `${value} property type must include one of [${Object.values(
            PROPERTY_TYPE
          )}]`
      ),
    body("propertyStatus")
      .notEmpty()
      .isString()
      .isIn(Object.values(PROPERTY_STATUS))
      .withMessage(
        (value) =>
          `${value} property status must include one of [${Object.values(
            PROPERTY_STATUS
          )}]`
      ),
    body("images").notEmpty().isString(),
    body("features").optional().isString(),
    body("hide")
      .optional()
      .isBoolean()
      .withMessage((value) => `${value} must be a boolean`),
    body("address")
      .notEmpty()
      .isObject()
      .withMessage((value) => `${value} must be an object`),
    body("address.country")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Country must be a string")
      .trim()
      .notEmpty()
      .withMessage("Country cannot be empty if provided."),
    body("address.state")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("State must be a string")
      .trim()
      .notEmpty()
      .withMessage("State cannot be empty if provided."),
    body("address.city")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("City must be a string")
      .trim()
      .notEmpty()
      .withMessage("City cannot be empty if provided."),
    body("address.area")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Area must be a string")
      .trim()
      .notEmpty()
      .withMessage("Area cannot be empty if provided."),
    body("address.zipCode")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Zip Code must be a string")
      .trim()
      .notEmpty()
      .withMessage("Zip Code cannot be empty if provided."),
    body("address.other")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Other details must be a string")
      .trim()
      .notEmpty()
      .withMessage("Other details cannot be empty if provided."),
  ];
};

propertyValidation.updatePropertyValidation = () => {
  return [
    param("propertyId")
      .isMongoId()
      .withMessage((value) => `"${value}" Invalid property ID format`)
      .custom(async (value) => {
        const property = await Property.findOne({ _id: value });
        if (!property) {
          throw new Error("NOT_EXIST");
        }
        return true;
      })
      .withMessage((value) => `"${value}" property is not exist`),
    body("title")
      .optional()
      .isLength({ min: 3, max: 120 })
      .withMessage(
        (value) =>
          `"${value}" property name length should contain 15 to 120 charachters`
      )
      // .custom(checkPropertyTitleUniqueOnUpdate)
      .custom((value, { req }) =>
        checkDocumentTitleUniqueOnUpdate(
          value,
          Property,
          req.params?.propertyId
        )
      )
      .withMessage(
        (value) =>
          `"${value}" property title is already taken, choose another one`
      ),
    body("description")
      .optional()
      .isLength({ min: 15 })
      .withMessage(
        (value) =>
          `"${value}" property description length should contain 15 charachters at least`
      ),
    body("price")
      .optional()
      .isNumeric()
      .withMessage((value) => `${value} price must be a number`),
    body("propertySize").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("bedrooms").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("bathrooms").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("garage").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("garageSize").optional().isNumeric().withMessage(mustBeNumberMsg),
    body("yearBuilt")
      .optional()
      .isNumeric() // BUG:if the value is string number like "2001", it will pass
      .withMessage((value) => `${value} must be a number`)
      .custom(isValidateYearBuilt),
    body("propertyType")
      .optional()
      .isIn(Object.values(PROPERTY_TYPE))
      .withMessage(
        (value) =>
          `${value} property type must include one of [${Object.values(
            PROPERTY_TYPE
          )}]`
      ),
    body("propertyStatus")
      .optional()
      .isIn(Object.values(PROPERTY_STATUS))
      .withMessage(
        (value) =>
          `${value} property status must include one of [${Object.values(
            PROPERTY_STATUS
          )}]`
      ),
    body("images").optional().isString(),
    body("features").optional().isString(),
    body("hide")
      .optional()
      .isBoolean()
      .withMessage((value) => `${value} must be a boolean`),
    body("address")
      .optional()
      .isObject()
      .withMessage((value) => `${value} must be an object`),
    body("address.country")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Country must be a string")
      .trim()
      .notEmpty()
      .withMessage("Country cannot be empty if provided."),
    body("address.state")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("State must be a string")
      .trim()
      .notEmpty()
      .withMessage("State cannot be empty if provided."),
    body("address.city")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("City must be a string")
      .trim()
      .notEmpty()
      .withMessage("City cannot be empty if provided."),
    body("address.area")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Area must be a string")
      .trim()
      .notEmpty()
      .withMessage("Area cannot be empty if provided."),
    body("address.zipCode")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Zip Code must be a string")
      .trim()
      .notEmpty()
      .withMessage("Zip Code cannot be empty if provided."),
    body("address.other")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage("Other details must be a string")
      .trim()
      .notEmpty()
      .withMessage("Other details cannot be empty if provided."),
  ];
};

propertyValidation.singlePropertyValidation = () =>
  checkSingleRequestByParam("slug", Property);

propertyValidation.deletePropertyValidation = () =>
  checkObjectId("propertyId", Property);
