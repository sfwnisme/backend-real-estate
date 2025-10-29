const { STATUS_TEXT } = require("../config/enum.config")
const AppError = require("../utils/appError")
const appError = new AppError()

module.exports = (...roles) => {
  // console.log('authorizedRole.js', roles)
  return (req, res, next) => {
    try {
      // const user = req.body.user
      const user = req.user
      if (!roles.includes(user.role)) {
        appError.create(403, STATUS_TEXT.ERROR, `Unauthorized role:${user.role}, you do not have a permission on this route`)
        return next(appError)
      }
      console.log('access accepted')
      return next()
    } catch (error) {
      appError.create(400, STATUS_TEXT.ERROR, error.message)
      return next(appError)
    }
  }
}