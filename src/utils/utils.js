const { default: slugify } = require("slugify");
const { STATUS_TEXT } = require("../config/enum.config");
const AppError = require("./appError");
const utils = module.exports;
const crypto = require("crypto");
const path = require("path");

utils.removeObjectKeys = (keys, obj) => {
  // const { [key]: omitted, ...rest } = obj
  let newObj = { ...obj };
  if (!Array.isArray(keys)) {
    delete newObj[keys];
  }
  for (const key of keys) {
    delete newObj[key];
  }

  return newObj;
};

utils.handleUndefined = (req, res, next) => {
  (moduleResponse) => {
    if (!moduleResponse) {
      const appError = new AppError();
      appError.create(400, STATUS_TEXT.FAIL, "not found");
      return next(appError);
    }
  };
};

utils.slugGenerator = (text) => {
  // using hyphen(-) as a slug separator, following google SEO standards
  return slugify(text, "-");
};

utils.calculateReadingTime = (text) => {
  // Average reading speed for Arabic and English
  // src: https://irisreading.com/average-reading-speed-in-various-languages/
  const wordsPerMinute = 250;
  const noOfWords = text.split(/\s/g).length; // Count words by splitting on whitespace
  const minutes = noOfWords / wordsPerMinute;
  const readTime = Math.ceil(minutes); // Round up to the nearest whole minute
  return `${readTime} min read`;
};

utils.setPublishedAt = (data) => {
  if (data.status === "published" && !data.publishedAt) {
    return Date.now();
  }
  return null;
};

/**
 * Determines the Open Graph (ogImage) image to use for sharing.
 * If data.meta.ogImage is not defined or is falsy, falls back to data.coverImage.
 *
 * @param {Object} data - The blog post or content object.
 * @param {Object} [data.meta] - Optional meta information object.
 * @param {string} [data.meta.ogImage] - Optional Open Graph image url.
 * @param {string} [data.coverImage] - The fallback main cover image url.
 * @returns {string|undefined} - The resolved ogImage URL, or undefined if not found.
 */
utils.setOgImage = (data) => {
  // If there is a specific ogImage in the meta field, use it.
  // Otherwise, fallback to the general coverImage.
  if (data?.meta?.ogImage) {
    return data.meta.ogImage;
  }
  return data.coverImage;
};

utils.generateUUID = () => {
  const uuid = crypto.randomUUID();
  return uuid;
};

utils.removeStringSpaces = (str) => {
  if (!str) return "no string provided";
  const strToArr = str.split(" ");
  const arrToStr = strToArr.join("");
  return arrToStr;
};

/**
 * remove spaces from file name.
 * it make the file name clear for the urls
 * @param {string} str - must pass file.name not file itself
 * @returns {string}
 */
utils.noFileNameSpaces = (fileName) => {
  const { base } = path.parse(fileName);
  if (!base) return "no string provided";
  const strToArr = base.split(" ");
  const arrToStr = strToArr.join("_");
  const newName = `${arrToStr}`;

  return newName;
};

/**
 * aws s3 image url
 * @param {string} paramsKey
 */
utils.awsS3ImageUrl = (paramsKey) => {
  if (!paramsKey) return "image params.key not found";
  const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_BUCKET_REGION}.amazonaws.com/${paramsKey}`;
  return url;
};
