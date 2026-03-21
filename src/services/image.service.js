const {
  STATUS_TEXT,
  FILES_CONFIGS,
  MODELS,
} = require("../config/enum.config");
const { formatApiResponse } = require("../utils/response");
const { createImage } = require("../integrations/image.service");
const { deleteObject } = require("../integrations/aws-s3.service");
const SiteInfo = require("../models/site-info.model");
const Image = require("../models/image.model");

const imageService = module.exports;

/**
 * Create or replace a site-info image (role/tag fixed server-side per route).
 * Loads SiteInfo, removes prior image for the same owner + role + tag, uploads via integration createImage.
 */
imageService.createSiteInfoImage = async (file, role, tag, alt) => {
  try {
    const siteInfo = await SiteInfo.findOne({});
    if (!siteInfo) {
      return formatApiResponse(
        404,
        STATUS_TEXT.FAIL,
        "site info document not found",
      );
    }

    const ownerId = siteInfo._id;
    const ownerModel = MODELS.SITE_INFO;
    const bucketDir = FILES_CONFIGS.DIRS.SITE_INFO;

    const oldImage = await Image.findOneAndDelete({
      ownerId,
      ownerModel,
      role,
      tag,
    });
    if (oldImage?.fileName) {
      await deleteObject(oldImage.fileName);
    }

    return await createImage(
      file,
      ownerId,
      ownerModel,
      bucketDir,
      false,
      false,
      role,
      tag,
      alt,
    );
  } catch (error) {
    console.error("imageService.createSiteInfoImage: ", error);
    return formatApiResponse(400, STATUS_TEXT.ERROR, error.message, error);
  }
};
