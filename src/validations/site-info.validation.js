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

    body(`${lang}.info.email`)
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage(`${lang}.info.email must be a valid email address`),

    body(`${lang}.info.phone`)
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 30 })
      .withMessage(`${lang}.info.phone must be a string under 30 characters`),

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
const socialMediaValidations = () => [
  body("socialMedia")
    .optional()
    .isObject()
    .withMessage("socialMedia must be an object"),

  body("socialMedia.facebook")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("socialMedia.facebook must be a valid URL"),

  body("socialMedia.instagram")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("socialMedia.instagram must be a valid URL"),

  body("socialMedia.twitter")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("socialMedia.twitter must be a valid URL"),

  body("socialMedia.linkedin")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("socialMedia.linkedin must be a valid URL"),

  body("socialMedia.youtube")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("socialMedia.youtube must be a valid URL"),

  body("socialMedia.tiktok")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("socialMedia.tiktok must be a valid URL"),

  body("socialMedia.snapchat")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isURL()
    .withMessage("socialMedia.snapchat must be a valid URL"),

  body("socialMedia.whatsapp")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("socialMedia.whatsapp must be a string"),
];

const marketingIntegrationsValidations = () => [
  body("marketingIntegrations")
    .optional()
    .isObject()
    .withMessage("marketingIntegrations must be an object"),

  body("marketingIntegrations.googleSearchConsole")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("marketingIntegrations.googleSearchConsole must be a string"),

  body("marketingIntegrations.googleTagManager")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("marketingIntegrations.googleTagManager must be a string"),

  body("marketingIntegrations.googleMerchant")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .withMessage("marketingIntegrations.googleMerchant must be a string"),
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

siteInfoValidation.createSiteInfoValidation = () => {
  return [
    ...localizedFieldValidations("ar"),
    ...localizedFieldValidations("en"),
    ...socialMediaValidations(),
    ...marketingIntegrationsValidations(),
    ...settingsValidations(),
  ];
};

siteInfoValidation.updateSiteInfoValidation = () => {
  return [
    ...localizedFieldValidations("ar"),
    ...localizedFieldValidations("en"),
    ...socialMediaValidations(),
    ...marketingIntegrationsValidations(),
    ...settingsValidations(),
  ];
};
