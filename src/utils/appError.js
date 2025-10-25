//----------------------------
// controllers error response schema
//----------------------------

class AppError extends Error {
  create(statusCode, statusText, message) {
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.message = message;
    return this
  }
}

module.exports = AppError