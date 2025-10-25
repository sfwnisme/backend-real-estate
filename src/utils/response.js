const { SUCCESS, ERROR } = require("../config/statusText.config");

module.exports.formatApiResponse = (
  status = 500,
  statusText = ERROR,
  msg = "internal server error",
  data = null
) => {
  if (statusText !== SUCCESS) {
    return { status, statusText, msg, error: data };
  }
  return { status, statusText, msg, data };
};


