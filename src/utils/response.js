const {STATUS_TEXT} = require("../config/enum.config");
const { parseStackTrace } = require("./utils");

module.exports.formatApiResponse = (
  status = 500,
  statusText = STATUS_TEXT.ERROR,
  msg = "internal server error",
  data = null
) => {
  if (statusText !== STATUS_TEXT.SUCCESS) {
    return { status, statusText, msg, error: parseStackTrace(data)};
  }
  return { status, statusText, msg, data };
};


