const {STATUS_TEXT} = require("../config/enum.config");

module.exports.formatApiResponse = (
  status = 500,
  statusText = STATUS_TEXT.ERROR,
  msg = "internal server error",
  data = null
) => {
  if (statusText !== STATUS_TEXT.SUCCESS) {
    return { status, statusText, msg, error: data };
  }
  return { status, statusText, msg, data };
};


