const { body } = require("express-validator");

const siteInfoValidation = module.exports;

// -----------------------------------------------
// Helper: generates validation rules for localized
// fields under a given language prefix ("ar" or "en")
// -----------------------------------------------
const localizedFieldValidations = (lang) => {
  return [
    body(`${lang}`)
      .optional()
      .isObject()
      .withMessage(`${lang} must be an object`),

    // -- info --
    body(`${lang}.info`)
      .optional()
      .isObject()
      .withMessage(`${lang}.info must be an object`),

    body(`${lang}.info.name`)
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 120 })
      .withMessage(`${lang}.info.name must be a string under 120 characters`),

    body(`${lang}.info.address`)
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage(
        `${lang}.info.address must be a string under 500 characters`
      ),

    body(`${lang}.info.description`)
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        `${lang}.info.description must be a string under 2000 characters`
      ),

    // -- seo --
    body(`${lang}.seo`)
      .optional()
      .isObject()
      .withMessage(`${lang}.seo must be an object`),

    body(`${lang}.seo.title`)
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 120 })
      .withMessage(`${lang}.seo.title must be a string under 120 characters`),

    body(`${lang}.seo.description`)
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 300 })
      .withMessage(
        `${lang}.seo.description must be a string under 300 characters`
      ),

    body(`${lang}.seo.keywords`)
      .optional({ nullable: true, checkFalsy: true })
      .isArray()
      .withMessage(`${lang}.seo.keywords must be an array of strings`),

    body(`${lang}.seo.ogImage`)
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage(`${lang}.seo.ogImage must be a string`),
  ];
};

// -----------------------------------------------
// Shared: non-localized field validations
// -----------------------------------------------
const contactValidations = () => [
  body("contact.email")
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage("contact.email must be a valid email address"),

  body("contact.phone")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage("contact.phone must be a string under 30 characters"),

  body("contact.facebook")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("contact.facebook must be a valid URL"),

  body("contact.instagram")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("contact.instagram must be a valid URL"),

  body("contact.x")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("contact.x must be a valid URL"),

  body("contact.linkedin")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("contact.linkedin must be a valid URL"),

  body("contact.youtube")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("contact.youtube must be a valid URL"),

  body("contact.tiktok")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("contact.tiktok must be a valid URL"),

  body("contact.snapchat")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("contact.snapchat must be a valid URL"),

  body("contact.whatsapp")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("contact.whatsapp must be a string"),
];

const marketingValidations = () => [
  body("marketing.googleSearchConsole")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("marketing.googleSearchConsole must be a string"),

  body("marketing.googleTagManager")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("marketing.googleTagManager must be a string"),

  body("marketing.googleMerchant")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("marketing.googleMerchant must be a string"),
];

const settingsValidations = () => [
  body("settings")
    .optional()
    .isObject()
    .withMessage("settings must be an object"),

  body("settings.maintenanceMode")
    .optional()
    .isBoolean()
    .withMessage("settings.maintenanceMode must be a boolean"),
];

// -----------------------------------------------
// Exported validation functions
// -----------------------------------------------

const logoValidation = () => [
  body("logo")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("logo must be a string"),

  body("favicon")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("favicon must be a string"),
];

siteInfoValidation.createSiteInfoValidation = () => {
  return [
    ...logoValidation(),
    ...localizedFieldValidations("ar"),
    ...localizedFieldValidations("en"),
    ...contactValidations(),
    ...marketingValidations(),
    ...settingsValidations(),
  ];
};

siteInfoValidation.updateSiteInfoValidation = () => {
  return [
    ...logoValidation(),
    ...localizedFieldValidations("ar"),
    ...localizedFieldValidations("en"),
    ...contactValidations(),
    ...marketingValidations(),
    ...settingsValidations(),
  ];
};
