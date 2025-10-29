const { check } = require("express-validator");

const validatorHelpers = module.exports;

/**
 * property yearBuilt field is a number
 * this function valid years range
 * @param {string} value
 * @returns
 */
validatorHelpers.isValidateYearBuilt = (value) => {
  const minValue = 1900;
  const maxValue = new Date().getFullYear() + 10;
  if (typeof value !== "number") {
    throw new Error(
      `${value} is a string, instead it must be a number between ${minValue} and ${maxValue}`
    );
  }
  if (value < minValue || value > maxValue) {
    throw new Error(`number must be between ${minValue} and ${maxValue}`);
  }
  return true;
};

/**
 * Checks if a document EXISTS for use in Express/Mongoose validators.
 * Throws an error depends on the @param exist, which returns found or not found document.
 * * @param {string} key - document's field name (e.g., 'userId')
 * @param {*} value - document field's value (e.g., the ID being checked)
 * @param {*} model - mongoose model (e.g., User)
 * @param {boolean} exists - true or false
 * @returns { boolean }
 */
validatorHelpers.documentExists = async (key, value, model, exist = true) => {
  const modelValue = await model.findOne({ [key]: value });
  const isExist = modelValue;
  const notExist = !modelValue;
  const theExistence = exist ? isExist : notExist;
  const theExistenceMsg = exist ? "IS_FOUND" : "NOT_FOUND";
  if (theExistence) {
    throw new Error(theExistenceMsg);
  }
  return true;
};

/**
 *
 * @param {string} field
 * @param {any} model
 * @returns
 */
validatorHelpers.checkSingleRequestByParam = (field, model) => {
  return [
    check(field)
      .custom(async (value) => this.documentExists(field, value, model, false))
      .withMessage((value) => `${value} is not exist`),
  ];
};

validatorHelpers.checkObjectId = (field, model) => {
  return [
    check(field)
      .isMongoId()
      .withMessage((value) => `${value} Invalid ${field} format`)
      .custom(async (value) => {
        const modelValue = await model.findOne({ _id: value });
        if (!modelValue) {
          throw new Error("NOT_EXIST");
        }
        return true;
      })
      .withMessage((value) => `"${value}" is not exist`),
  ];
};

/**
 * Checks if the document title is unique on update.
 * @param {string} value - The new title to check uniqueness for.
 * @param {Model} model - The Mongoose model to query.
 * @param {string} docId - The id of the document being updated.
 * @returns {Promise<boolean>} - Returns true if unique, throws error if not.
 */
validatorHelpers.checkDocumentTitleUniqueOnUpdate = async function (
  value,
  model,
  docId
) {
  const newTitle = value ?? "";
  const modelValue = await model.findOne({
    _id: { $ne: docId },
    title: newTitle,
  });
  if (modelValue) {
    throw new Error(
      `"${value}" title is already taken, choose another one ${docId}`
    );
  }
  return true;
};
