const { body } = require("express-validator");
const { documentExists } = require("./validatorHelpers");
const Property = require("../models/property.model");
const Image = require("../models/image.model");
const SiteInfo = require("../models/site-info.model");
const { IMAGE_ROLE_CONSTRAINTS } = require("../config/enum.config");
const { imageSize } = require("image-size");

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

/** After multer + injectSiteInfoMeta: validates optional alt and dimensions from req.siteInfoImageMeta.role */
imageValidation.siteInfoImageCreateValidation = () => {
  return [
    body("alt")
      .optional()
      .trim()
      .isString()
      .withMessage("alt must be a string"),
    body().custom((_, { req }) => {
      const file = req.file;
      if (!file) throw new Error("file is required");

      const meta = req.siteInfoImageMeta;
      if (!meta?.role) {
        throw new Error("site info image meta is missing");
      }

      const { role } = meta;
      const constraints = IMAGE_ROLE_CONSTRAINTS[role];
      if (!constraints) return true;

      const dimensions = imageSize(file.buffer);

      if (role === "icon") {
        const validDim = constraints.dimensions.some(
          (d) => d.width === dimensions.width && d.height === dimensions.height,
        );
        if (!validDim) {
          const allowed = constraints.dimensions
            .map((d) => `${d.width}x${d.height}`)
            .join(", ");
          throw new Error(
            `Icon dimensions must be one of: ${allowed}. Got ${dimensions.width}x${dimensions.height}`,
          );
        }
      }

      if (role === "logo") {
        if (
          dimensions.width < constraints.minWidth ||
          dimensions.height < constraints.minHeight ||
          dimensions.width > constraints.maxWidth ||
          dimensions.height > constraints.maxHeight
        ) {
          throw new Error(
            `Logo dimensions must be between ${constraints.minWidth}x${constraints.minHeight} and ${constraints.maxWidth}x${constraints.maxHeight}. Got ${dimensions.width}x${dimensions.height}`,
          );
        }
      }

      return true;
    }),
  ];
};


imageValidation.getImageValidation = () => {
  return [
    body().custom(async (_, { req }) => {
      const siteInfo = await SiteInfo.findOne({});
      if (!siteInfo) {
        throw new Error("site info document not found");
      }
      req.siteInfo = siteInfo;
      console.log("😁siteInfo", siteInfo);
      return true;
    }),
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
