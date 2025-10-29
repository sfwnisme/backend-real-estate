const { validationResult } = require("express-validator");
const AppError = require("../utils/appError.js");
const { STATUS_TEXT } = require("../config/enum.config");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    const appError = new AppError();
    appError.create(400, STATUS_TEXT.FAIL, validationErrors);

    return next(appError);
  }
  next();
};
  // const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   appError.create(400, STATUS_TEXT.FAIL, errors.array());
  //   return next(appError);
  // }