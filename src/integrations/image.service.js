const { STATUS_TEXT, FILES_CONFIGS, MODELS } = require("../config/enum.config");
const { formatApiResponse } = require("../utils/response");
const { noFileNameSpaces, generateUUID } = require("../utils/utils");
const { putObject } = require("./aws-s3.service");
const AppError = require("../utils/appError");
const { default: imageSize } = require("image-size");
const Image = require("../models/image.model");
const appError = new AppError();

const imageServices = module.exports;

imageServices.createImage = async (
  file,
  ownerId,
  ownerModel,
  bucketDir = FILES_CONFIGS.DIRS.DEFAULT
) => {
  try {
    if (!file) {
      return formatApiResponse(
        400,
        STATUS_TEXT.ERROR,
        "file not found, object key must be 'file', or you have to add image"
      );
    }
    console.log("multer file", file);
    const fileName = noFileNameSpaces(file.originalname);
    const awsS3Dir = bucketDir;
    const createUUID = generateUUID();
    const newFileName = `${awsS3Dir}${createUUID}${fileName}`;

    const createImageResponse = await putObject(file.buffer, newFileName);
    console.log("putObject->", createImageResponse);
    const { url, key } = createImageResponse;

    if (!url || !key) {
      appError.create(400, STATUS_TEXT.ERROR, "url or key is not found, ");
      return formatApiResponse(
        400,
        STATUS_TEXT.ERROR,
        "url or key is not found"
      );
    }

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
    };

    const addImagesToDB = new Image(imageObject);
    await addImagesToDB.save();
    const imageFromDB = await Image.findById(addImagesToDB._id).lean();

    return formatApiResponse(
      201,
      STATUS_TEXT.SUCCESS,
      "The image created successfully",
      imageFromDB
    );
  } catch (error) {
    console.error("imageServices.createImage: ", error);
    return formatApiResponse(400, STATUS_TEXT.ERROR, error.message, error);
  }
};
imageServices.updateImageOwner = async (imageId, ownerId, ownerModel) => {
  try {
    const updateImageObject = {
      ownerModel,
      ownerId,
    };

    console.log('update image owner imageId=', imageId)

    await Image.updateOne({ _id: imageId }, updateImageObject, {
      runValidators: true,
    });

    const imageFromDB = await Image.findById(imageId);

    return formatApiResponse(
      201,
      STATUS_TEXT.SUCCESS,
      "The image updated successfully",
      imageFromDB
    );
  } catch (error) {
    console.error("imageServices.updateImageOwner: ", error);
    return formatApiResponse(400, STATUS_TEXT.ERROR, error.message, error);
  }
};
