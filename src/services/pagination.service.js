const { STATUS_TEXT } = require("../config/enum.config");
const { formatApiResponse } = require("../utils/response");

module.exports.paginationService = async (
  page,
  pageSize,
  model,
  filter = {},
) => {
  try {
    const pageToNum = parseInt(page, 10) || 1;
    const pageSizeToNum = parseInt(pageSize, 10) || 10;
    const skip = (pageToNum - 1) * pageSizeToNum;

    const totalDocs = await model.countDocuments(filter);
    const docs = await model.aggregate([
      { $match: filter },
      { $skip: skip },
      { $limit: pageSizeToNum },
    ]);

    const totalPages = Math.ceil(totalDocs / pageSizeToNum);
    const prevPage = pageToNum > 1 ? pageToNum - 1 : null;
    const nextPage = pageToNum < totalPages ? pageToNum + 1 : null;

    const paginationResponse = {
      page: pageToNum,
      nextPage,
      prevPage,
      pageSize: pageSizeToNum,
      totalPages,
      totalData: totalDocs,
      data: docs,
    };

    return paginationResponse;
  } catch (error) {
    console.log("paginationResponse Error: ", error);
    return formatApiResponse(400, STATUS_TEXT.ERROR, error.stack, error);
  }
};
