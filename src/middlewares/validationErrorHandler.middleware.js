const { validationResult } = require("express-validator");
const AppError = require("../utils/appError.js");
const statusText = require("../config/statusText.config");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    const appError = new AppError();
    appError.create(400, statusText.FAIL, validationErrors);

    return next(appError);
  }
  next();
};
  // const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   appError.create(400, statusText.FAIL, errors.array());
  //   return next(appError);
  // }