const { default: slugify } = require("slugify");
const { STATUS_TEXT } = require("../config/enum.config");
const AppError = require("./appError");
const crypto = require("crypto");
const path = require("path");

const utils = module.exports;

utils.removeObjectKeys = (keys, obj) => {
  // const { [key]: omitted, ...rest } = obj
  const newObj = { ...obj };
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
