// blog.validation.js
const { body, param } = require("express-validator");

// Assuming these utilities and enums are available:
const BlogPost = require("../models/blog-post.model");
const { BLOG_POST_STATUS } = require("../config/enum.config");
const {
  documentExists,
  checkSingleRequestByParam,
  checkDocumentTitleUniqueOnUpdate,
  checkObjectId,
  checkDocTitleUniqueOnCreate,
} = require("./validatorHelpers");
const { slugGenerator } = require("../utils/utils");

// Reusable message helper
const mustBeStringMsg = (field) => `${field} must be a string.`;
const blogValidation = module.exports;

blogValidation.createBlogPostValidation = () => {
  return [
    body("tempId")
      .optional()
      .isMongoId()
      .withMessage("tempId must be a valid mongoId"),
    body("title")
      .notEmpty()
      .withMessage("Blog title cannot be empty")
      .isLength({ min: 10, max: 120 })
      .withMessage(
        (value, { req, path }) =>
          `"${value}" ${path} length must contain 10 to 120 characters`
      )
      .custom(async (value) => checkDocTitleUniqueOnCreate(value, BlogPost))
      .withMessage("title exists"),
      
    body("excerpt")
      .notEmpty()
      .withMessage("Excerpt/summary is required")
      .isLength({ min: 20, max: 300 })
      .withMessage(
        (value, { req, location, path, options }) =>
          `${value} ${path} length should be between 20 and 300 characters`
      ),

    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 20, max: 10000 }) // min: 300 in production
      .withMessage(
        (value, { path }) =>
          `"${value}" ${path} length should be between 500 and 10000 characters`
      ),
    body("coverImage")
      .optional({ nullable: true }) // Matches your schema's default: null
      .isMongoId()
      .withMessage("cover image must be a mongoId or null"),

    body("status")
      .notEmpty()
      .isString()
      .isIn(Object.values(BLOG_POST_STATUS))
      .withMessage(
        (value) =>
          `${value} status must be one of [${Object.values(
            BLOG_POST_STATUS
          ).join(", ")}]`
      ),

    // --- META OBJECT AND NESTED FIELDS ---

    // Ensure 'meta' is present (optional as it has default: {}) and is an object
    body("meta")
      .optional()
      .isObject()
      .withMessage("Meta data must be an object."),

    // NESTED META FIELDS: All are optional ({ nullable: true, checkFalsy: true })

    body("meta.title")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 120 })
      .withMessage("Meta title must be a string under 120 characters.")
      .custom(async (value, { req, path }) =>
        documentExists(path, value, BlogPost, true)
      )
      .withMessage(
        (value, { req, path }) =>
          `"${value}" ${path} is already taken, choose another one`
      ),

    body("meta.description")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 300 })
      .withMessage("Meta description must be a string under 300 characters."),

    body("meta.keywords")
      .optional({ nullable: true, checkFalsy: true })
      .isArray()
      .withMessage("Meta keywords must be an array of strings."),

    body("meta.canonicalUrl")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage(mustBeStringMsg("Meta canonicalUrl")),

    body("meta.ogImage")
      .optional({ nullable: true, checkFalsy: true })
      .isMongoId()
      .withMessage("must be mongoId"),
  ];
};

blogValidation.updateBlogPostValidation = () => {
  return [
    ...checkSingleRequestByParam("blogPostId", BlogPost),
    body("title")
      .optional()
      .notEmpty()
      .withMessage("Blog title cannot be empty")
      .isLength({ min: 10, max: 120 })
      .withMessage(
        (value, { req, path }) =>
          `"${value}" ${path} length must contain 10 to 120 characters`
      )
      // Check if the title already exists (for generating a unique slug)
      .custom((value, { req }) =>
        checkDocumentTitleUniqueOnUpdate(
          value,
          BlogPost,
          req.params?.blogPostId
        )
      )
      .withMessage(
        (value, { req, path }) =>
          `${value} ${path} is already taken, choose another one`
      ),

    body("excerpt")
      .optional()
      .notEmpty()
      .withMessage("Excerpt/summary is required")
      .isLength({ min: 20, max: 300 })
      .withMessage(
        (value, { req, location, path, options }) =>
          `${value} ${path} length should be between 20 and 300 characters`
      ),

    body("content")
      .optional()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 20, max: 10000 }) // min: 300 in production
      .withMessage(
        (value, { path }) =>
          `"${value}" ${path} length should be between 500 and 10000 characters`
      ),
    body("coverImage")
      .optional({ nullable: true }) // Matches your schema's default: null
      .isMongoId()
      .withMessage("cover image must be a mongoId or null"),

    body("status")
      .optional()
      .notEmpty()
      .isString()
      .isIn(Object.values(BLOG_POST_STATUS))
      .withMessage(
        (value) =>
          `${value} status must be one of [${Object.values(
            BLOG_POST_STATUS
          ).join(", ")}]`
      ),

    // --- META OBJECT AND NESTED FIELDS ---

    // Ensure 'meta' is present (optional as it has default: {}) and is an object
    body("meta")
      .optional()
      .isObject()
      .withMessage("Meta data must be an object."),

    // NESTED META FIELDS: All are optional ({ nullable: true, checkFalsy: true })

    body("meta.title")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 120 })
      .withMessage("Meta title must be a string under 120 characters.")
      .custom(async (value, { req, path }) =>
        documentExists(path, value, BlogPost, true)
      )
      .withMessage(
        (value, { req, path }) =>
          `"${value}" ${path} is already taken, choose another one`
      ),

    body("meta.description")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 300 })
      .withMessage("Meta description must be a string under 300 characters."),

    body("meta.keywords")
      .optional({ nullable: true, checkFalsy: true })
      .isArray()
      .withMessage("Meta keywords must be an array of strings."),

    body("meta.canonicalUrl")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage(mustBeStringMsg("Meta canonicalUrl")),

    body("meta.ogImage")
      .optional({ nullable: true, checkFalsy: true })
      .isMongoId()
      .withMessage("must be an object id"),
  ];
};

blogValidation.singleBlogPostValidation = () =>
  checkSingleRequestByParam("slug", BlogPost);

blogValidation.deleteBlogPostValidation = () =>
  checkObjectId("blogPostId", BlogPost);
