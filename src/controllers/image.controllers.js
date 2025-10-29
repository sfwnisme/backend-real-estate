const { formatApiResponse } = require("../utils/response.js");
const {
  STATUS_TEXT,
  FILES_CONFIGS,
  MODELS,
} = require("../config/enum.config.js");
const AppError = require("../utils/appError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const { generateUUID, noFileNameSpaces } = require("../utils/utils.js");
const Image = require("../models/image.model.js");
const { imageSize } = require("image-size");
const { createImage, deleteImageFromDBAndBucket } = require("../integrations/image.service.js");
const { default: mongoose } = require("mongoose");
const {
  deleteObject,
  putObject,
} = require("../integrations/aws-s3.service.js");

const appError = new AppError();

const imageControllers = module.exports;

imageControllers.getImages = asyncWrapper(async (req, res, next) => {
  const images = await Image.find({}, { __v: false });
  // if(!images) 
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "images fetched successfully",
        images
      )
    );
});

imageControllers.getPropertyImages = asyncWrapper(async (req, res, next) => {
  const { propertyId } = req.params;

  const images = await Image.find(
    { ownerId: propertyId, ownerModel: MODELS.PROPERTY },
    { __v: false }
  );
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "images fetched successfully",
        images
      )
    );
});

imageControllers.getImage = asyncWrapper(async (req, res, next) => {
  const { imageId } = req.params;
  const image = await Image.findOne({ _id: imageId }, { __v: false });
  console.log("image not ound", image)
  if(!image) {
    return res
    .status(404)
    .json(
      formatApiResponse(
        404,
        STATUS_TEXT.FAIL,
        "image not found",
        image
      )
    );
  }
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "images fetched successfully",
        image
      )
    );
});

// imageControllers.getImages = asyncWrapper(async (req, res) => {});
imageControllers.createImage = asyncWrapper(async (req, res, next) => {
  const {
    file,
    body: { ownerModel, ownerId },
  } = req;

  if (!file) {
    return res
      .status(400)
      .json(
        formatApiResponse(
          400,
          STATUS_TEXT.ERROR,
          "file not found, object key must be 'file', or you have to add image"
        )
      );
  }
  console.log("multer file", file);
  const fileName = noFileNameSpaces(file.originalname);
  const awsS3Dir = FILES_CONFIGS.DIRS.IMAGES;
  const createUUID = generateUUID();
  const newFileName = `${awsS3Dir}${createUUID}${fileName}`;

  const createImageResponse = await putObject(file.buffer, newFileName);
  console.log("putObject->", createImageResponse);
  const { url, key } = createImageResponse;

  if (!url || !key) {
    appError.create(400, STATUS_TEXT.ERROR, "url or key is not found, ");
    return next(appError);
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

  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        STATUS_TEXT.SUCCESS,
        "The image created successfully",
        imageFromDB
      )
    );
});

imageControllers.createImages = asyncWrapper(async (req, res, next) => {
  const images = req.files;
  console.log("---> images:", images);

  if (images.length === 0) {
    return res
      .status(400)
      .json(
        formatApiResponse(
          400,
          STATUS_TEXT.ERROR,
          "files not found, object key must be 'files', or you have to add images"
        )
      );
  }

  const uploadPrams = images.map((file) => {
    const fileName = noFileNameSpaces(file?.originalname);
    const awsS3Dir = FILES_CONFIGS.DIRS.IMAGES;
    const createUUID = generateUUID();
    const newFileName = `${awsS3Dir}${fileName}${createUUID}`;

    return putObject(file.buffer, newFileName);
  });

  const awsS3ImagesResponse = await Promise.all(uploadPrams);

  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        STATUS_TEXT.SUCCESS,
        "The image created successfully",
        awsS3ImagesResponse
      )
    );
});

// imageControllers.updateImage = asyncWrapper(async (req, res) => {});
imageControllers.createPropertyImage = asyncWrapper(async (req, res, next) => {
  const {
    file,
    body: { propertyId },
  } = req;
  const ownerModel = MODELS.PROPERTY;

  console.log("file", file);

  if (!file) {
    return res.status(400).json({ msg: "file not found" });
  }
  if (!propertyId) {
    return res.status(400).json({ msg: "file not found" });
  }

  const createdImageRes = await createImage(
    file,
    propertyId,
    ownerModel,
    FILES_CONFIGS.DIRS.PROPERTIES
  );
  res
    .status(createdImageRes.status)
    .json(
      formatApiResponse(
        createdImageRes.status,
        createdImageRes.statusText,
        createdImageRes.msg,
        createdImageRes.data || createdImageRes.error
      )
    );
});

imageControllers.createBlogPostImage = asyncWrapper(async (req, res, next) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ msg: "file not found" });
  }

  // identify the ownerModel
  const ownerModel = MODELS.BLOG;
  // generate termporary objectId to pass the mongoose validation
  const temporaryOwnerId = new mongoose.Types.ObjectId();
  console.log("temorary owner object id generated: ", temporaryOwnerId);

  // generate the image
  console.log("file", file);

  if (!temporaryOwnerId) {
    return res.status(400).json({ msg: "file not found" });
  }

  const createdImageRes = await createImage(
    file,
    temporaryOwnerId,
    ownerModel,
    FILES_CONFIGS.DIRS.PROPERTIES
  );
  res
    .status(createdImageRes.status)
    .json(
      formatApiResponse(
        createdImageRes.status,
        createdImageRes.statusText,
        createdImageRes.msg,
        createdImageRes.data || createdImageRes.error
      )
    );
});

imageControllers.deleteImage = asyncWrapper(async (req, res, next) => {
  const { imageId } = req.params;

  if (!imageId) {
    appError.create(400, STATUS_TEXT.FAIL, "imageId param is required");
    next(appError);
  }

  //delete from aws s3 bucket
  const imageToDelete = await deleteImageFromDBAndBucket(imageId);
  console.log("--------> delete image", imageToDelete);

  if (imageToDelete.statusText !== STATUS_TEXT.SUCCESS) {
    return res.status(imageToDelete.status).json(imageToDelete);
  }


  return res
    .status(200)
    .json(
      formatApiResponse(
        imageToDelete.status,
        STATUS_TEXT.SUCCESS,
        `deleted successfully`,
        imageToDelete
      )
    );
});
