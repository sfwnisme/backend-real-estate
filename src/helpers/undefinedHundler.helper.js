const { STATUS_TEXT } = require("../config/enum.config");
const AppError = require("./appError");

/**
 * 
 * @param {boolean | null} moduleResponse - the data returned from the database
 * @param {function} next - the express 'next' middleware function
 * @returns {void | function} returns the result of next(appError) if the data base retunred undefined
 */
module.exports = (moduleResponse, next) => {
  if (!moduleResponse) {
    const appError = new AppError();
    appError.create(400, STATUS_TEXT.FAIL, "not found");
    return next(appError);
  }
};
