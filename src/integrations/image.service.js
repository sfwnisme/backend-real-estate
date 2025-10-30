const { STATUS_TEXT, FILES_CONFIGS, MODELS } = require("../config/enum.config");
const { formatApiResponse } = require("../utils/response");
const { noFileNameSpaces, generateUUID } = require("../utils/utils");
const { putObject, deleteObject } = require("./aws-s3.service");
const AppError = require("../utils/appError");
const { default: imageSize } = require("image-size");
const Image = require("../models/image.model");
const appError = new AppError();

const imageServices = module.exports;

/**
 *
 * @param {File} file
 * @param {ObjectId} ownerId
 * @param {enum} ownerModel
 * @param {enum} bucketDir
 * @param {boolean} isTemp
 * @returns
 */

imageServices.createImage = async (
  file,
  ownerId,
  ownerModel,
  bucketDir = FILES_CONFIGS.DIRS.DEFAULT,
  isTemp = true
) => {
  try {
    if (!file) {
      return formatApiResponse(
        400,
        STATUS_TEXT.ERROR,
        "file not found, object key must be 'file', or you have to add image"
      );
    }
    if (!ownerId) {
      return formatApiResponse(
        400,
        STATUS_TEXT.ERROR,
        "ownerId is not defined"
      );
    }

    // upload image to bucket
    console.log("multer file", file);
    const fileName = noFileNameSpaces(file.originalname);
    const awsS3Dir = bucketDir;
    const createUUID = generateUUID();
    const newFileName = `${awsS3Dir}${createUUID}${fileName}`;

    const createImageResponse = await putObject(file.buffer, newFileName);
    console.log("putObject->", createImageResponse);
    const { url, key } = createImageResponse;

    if (!url || !key) {
      appError.create(400, STATUS_TEXT.ERROR, "url or key is not found");
      return formatApiResponse(
        400,
        STATUS_TEXT.ERROR,
        "url or key is not found"
      );
    }

    // upload image to db
    const dimensions = imageSize(file?.buffer);

    const imageObject = {
      url: url,
      fileName: key,
      ownerModel,
      ownerId,
      mimeType: file.mimetype,
      size: file.size,
      dimensions: {
        width: dimensions?.width,
        height: dimensions?.height,
      },
      isFeatured: false,
      isTemp,
    };

    const addImagesToDB = new Image(imageObject);
    const imageCreation = await addImagesToDB.save();

    return formatApiResponse(
      201,
      STATUS_TEXT.SUCCESS,
      "The image created successfully",
      imageCreation
    );
  } catch (error) {
    console.error("imageServices.createImage: ", error);
    return formatApiResponse(400, STATUS_TEXT.ERROR, error.message, error);
  }
};

imageServices.deleteImageFromDBAndBucket = async (imageId) => {
  if (!imageId) {
    return formatApiResponse(400, STATUS_TEXT.ERROR, "imageId is required");
  }

  try {
    // check image existance from db
    const getImageFromDB = await Image.findById(imageId);
    if (!getImageFromDB) {
      return formatApiResponse(
        404,
        STATUS_TEXT.ERROR,
        "image not found",
        getImageFromDB
      );
    }

    const imageKey = getImageFromDB.fileName;

    if (!imageKey) {
      return formatApiResponse(
        400,
        STATUS_TEXT.ERROR,
        "the image key/fileName not found"
      );
    }

    // check Object existance
    const deleteImageFromAwsS3Buckt = await deleteObject(imageKey);

    if (deleteImageFromAwsS3Buckt.statusText !== STATUS_TEXT.SUCCESS) {
      const deletedImageFromDB = await Image.deleteOne({ _id: imageId });
      console.log("image only found on db, so deleted from aws");
      return formatApiResponse(
        204,
        STATUS_TEXT.SUCCESS,
        "image found on db, but not on aws s3 bucket, so it has been deleted from db",
        deletedImageFromDB
      );
    }

    // delete image from db
    const deletedImageFromDB = await Image.deleteOne({ _id: imageId });
    // return deleteImageFromAwsS3Buckt;
    return formatApiResponse(
      deleteImageFromAwsS3Buckt.status,
      deleteImageFromAwsS3Buckt.statusText,
      "image deleted from db and aws s3",
      deletedImageFromDB
    );
  } catch (error) {
    console.log("imageServices.deleteImage error>> ", error);
    return formatApiResponse(400, STATUS_TEXT.ERROR, error);
  }
};
