const { formatApiResponse } = require("../utils/response.js");
const AppError = require("../utils/appError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const SiteInfo = require("../models/site-info.model.js");
const { STATUS_TEXT } = require("../config/enum.config.js");

const appError = new AppError();

const siteInfoControllers = module.exports;

// GET /api/site-info - Public
siteInfoControllers.getSiteInfo = asyncWrapper(async (req, res, next) => {
  const siteInfo = await SiteInfo.findOne({}).lean();

  if (!siteInfo) {
    appError.create(404, STATUS_TEXT.FAIL, "site info document not found");
    return next(appError);
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "data fetched successfully",
        siteInfo
      )
    );
});

// POST /api/site-info - Admin/Manager only
siteInfoControllers.createSiteInfo = asyncWrapper(async (req, res, next) => {
  const { body } = req;

  const existingSiteInfo = await SiteInfo.countDocuments();
  if (existingSiteInfo > 0) {
    appError.create(
      409,
      STATUS_TEXT.FAIL,
      "site info document already exists, use PATCH to update"
    );
    return next(appError);
  }

  const createdSiteInfo = new SiteInfo(body);
  const siteInfoCreation = await createdSiteInfo.save();

  if (!siteInfoCreation) {
    appError.create(400, STATUS_TEXT.FAIL, "site info document creation failed");
    return next(appError);
  }

  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        STATUS_TEXT.SUCCESS,
        "site info document created successfully",
        siteInfoCreation
      )
    );
});

// PATCH /api/site-info - Admin/Manager only
siteInfoControllers.updateSiteInfo = asyncWrapper(async (req, res, next) => {
  const { body } = req;

  const siteInfo = await SiteInfo.findOne({});

  if (!siteInfo) {
    appError.create(404, STATUS_TEXT.FAIL, "site info document not found");
    return next(appError);
  }

  await SiteInfo.updateOne(
    { _id: siteInfo._id },
    { $set: body },
    { runValidators: true }
  );

  const updatedSiteInfo = await SiteInfo.findById(siteInfo._id);

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "site info document updated successfully",
        updatedSiteInfo
      )
    );
});

// DELETE /api/site-info - Admin only
siteInfoControllers.deleteSiteInfo = asyncWrapper(async (req, res, next) => {
  const siteInfoDeletion = await SiteInfo.deleteOne({});

  if (siteInfoDeletion.deletedCount === 0) {
    appError.create(
      404,
      STATUS_TEXT.FAIL,
      "site info document not found or could not be deleted"
    );
    return next(appError);
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "site info document deleted successfully",
        siteInfoDeletion
      )
    );
});
