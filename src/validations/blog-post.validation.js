const { body, param } = require("express-validator");

const BlogPost = require("../models/blog-post.model");
const { BLOG_POST_STATUS } = require("../config/enum.config");
const {
  documentExists,
  checkSingleRequestByParam,
  checkObjectId,
  checkDocTitleUniqueOnCreate,
  checkDocumentFieldUniqueOnUpdate,
} = require("./validatorHelpers");
const { slugGenerator } = require("../utils/utils");

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
      .isLength({ min: 20 })
      .withMessage(
        (value, { req, location, path, options }) =>
          `${value} ${path} length should be 20 characters minimum`
      ),

    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 20 })
      .withMessage(
        (value, { path }) =>
          `${path} length should be between 20 and 10000 characters`
      ),

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

    body("meta")
      .optional()
      .isObject()
      .withMessage("Meta data must be an object."),

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
      .withMessage((field) => `${field} must be a string.`),

    body("meta.ogImage")
      .optional({ nullable: true, checkFalsy: true })
      .isMongoId()
      .withMessage("must be mongoId"),
  ];
};

blogValidation.updateBlogPostValidation = () => {
  return [
    param("blogPostId")
      .custom(async (value) => documentExists("_id", value, BlogPost, false))
      .withMessage((value) => `${value} is not exist`),
    body("title")
      .optional()
      .notEmpty()
      .withMessage("Blog title cannot be empty")
      .isLength({ min: 10, max: 120 })
      .withMessage(
        (value, { req, path }) =>
          `"${value}" ${path} length must contain 10 to 120 characters`
      )
      .custom(async (value, { req, path }) =>
        checkDocumentFieldUniqueOnUpdate(
          path,
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
      .isLength({ min: 20 })
      .withMessage(
        (value, { req, location, path, options }) =>
          `${value} ${path} length should be 20 characters minimum`
      ),

    body("content")
      .optional()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 30 }) // min: 300 in production
      .withMessage(
        (value, { path }) =>
          `${path} length should be between 300 and 10000 characters`
      ),

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
    body("meta")
      .optional()
      .isObject()
      .withMessage("Meta data must be an object."),

    body("meta.title")
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 120 })
      .withMessage("Meta title must be a string under 120 characters.")
      .custom(async (value, { req, path }) =>
        checkDocumentFieldUniqueOnUpdate(
          path,
          value,
          BlogPost,
          req.params?.blogPostId
        )
      )
      .withMessage(
        (value, { req, path }) =>
          `${path}: "${value}", is already taken, choose another ${path}`
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
      .withMessage((field) => `${field} must be a string.`),

    body("meta.ogImage")
      .optional({ nullable: true, checkFalsy: true })
      .isMongoId()
      .withMessage("must be an object id"),
  ];
};

blogValidation.singleBlogPostValidation = () =>
  checkSingleRequestByParam("slug", BlogPost);

blogValidation.updateBlogPostSlugValidation = () => {
  return [
    body("blogPostId")
      .notEmpty()
      .withMessage("blogPostId can not be emptsy")
      .isMongoId()
      .withMessage("blogPostId is not a valid mongoId")
      .bail()
      .custom((value) => documentExists("_id", value, BlogPost, false))
      .withMessage("blogPostId is exist"),
    body("slug")
      .notEmpty()
      .withMessage("slug can not be emptsy")
      .bail()
      .custom(async (value) => {
        const generateSlug = slugGenerator(value);
        return documentExists("slug", generateSlug, BlogPost, true);
      })
      .withMessage("slug is exist, create another one"),
  ];
};

blogValidation.deleteBlogPostValidation = () =>
  checkObjectId("blogPostId", BlogPost);
