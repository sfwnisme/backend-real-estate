const { default: slugify } = require("slugify");
const statusText = require("../config/statusText.config");
const AppError = require("./appError");
const utils = module.exports;

utils.handleUndefined = (req, res, next) => {
  (moduleResponse) => {
    if (!moduleResponse) {
      const appError = new AppError();
      appError.create(400, statusText.FAIL, "not found");
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
