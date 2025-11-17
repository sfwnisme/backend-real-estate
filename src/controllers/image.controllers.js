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
const {
  createImage,
  deleteImageFromDBAndBucket,
} = require("../integrations/image.service.js");
const { default: mongoose } = require("mongoose");
const { putObject } = require("../integrations/aws-s3.service.js");

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

imageControllers.getImage = asyncWrapper(async (req, res, next) => {
  const { imageId } = req.params;
  const image = await Image.findOne({ _id: imageId }, { __v: false });
  console.log("image not ound", image);
  if (!image) {
    return res
      .status(404)
      .json(formatApiResponse(404, STATUS_TEXT.FAIL, "image not found", image));
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
// general images for random usages
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

imageControllers.getPropertyImages = asyncWrapper(async (req, res, next) => {
  const { propertyId } = req.params;
  const model = MODELS.PROPERTY;

  const images = await Image.find(
    { ownerId: propertyId, ownerModel: model },
    { __v: false }
  );

  if (images.length === 0) {
    return res
      .status(404)
      .json(
        formatApiResponse(
          404,
          STATUS_TEXT.FAIL,
          "property images not found",
          images
        )
      );
  }

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "property images fetched successfully",
        images
      )
    );
});

imageControllers.createPropertyImage = asyncWrapper(async (req, res, next) => {
  const {
    file,
    body: { propertyId },
  } = req;

  const imageFile = file;
  const ownerId = propertyId;
  const ownerModel = MODELS.PROPERTY;
  const bucketDir = FILES_CONFIGS.DIRS.PROPERTY;
  const isTemp = false;

  const createImageRes = await createImage(
    imageFile,
    ownerId,
    ownerModel,
    bucketDir,
    isTemp
  );

  res
    .status(createImageRes.status)
    .json(
      formatApiResponse(
        createImageRes.status,
        createImageRes.statusText,
        createImageRes.msg,
        createImageRes.data || createImageRes.error
      )
    );
});
imageControllers.createTempPropertyImage = asyncWrapper(
  async (req, res, next) => {
    const {
      file,
      body: { tempId },
    } = req;
    const imageFile = file
    const tempOwnerId = tempId;
    const ownerModel = MODELS.PROPERTY;
    const bucketDir = FILES_CONFIGS.DIRS.PROPERTIES;
    const isTemp = true;

    const createImageRes = await createImage(
      imageFile,
      tempOwnerId,
      ownerModel,
      bucketDir,
      isTemp
    );
    res
      .status(createImageRes.status)
      .json(
        formatApiResponse(
          createImageRes.status,
          createImageRes.statusText,
          createImageRes.msg,
          createImageRes.data || createImageRes.error
        )
      );
  }
);

imageControllers.getBlogPostImage = asyncWrapper(async (req, res, next) => {
  const { blogPostId } = req.params;
  const model = MODELS.BLOG;
  console.log("pass", blogPostId);
  const image = await Image.findOne(
    { ownerId: blogPostId, ownerModel: model },
    { __v: false }
  );

  console.log("------blog post image", image);
  if (!image) {
    return res
      .status(404)
      .json(
        formatApiResponse(
          404,
          STATUS_TEXT.FAIL,
          "blog post image not found",
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
        "blog post image fetched successfully",
        image
      )
    );
});

imageControllers.createBlogPostImage = asyncWrapper(async (req, res, next) => {
  const {
    file,
    body: { blogPostId },
  } = req;
  const imageFile = file;
  const ownerId = blogPostId;
  const ownerModel = MODELS.BLOG;
  const bucketDir = FILES_CONFIGS.DIRS.BLOG;
  const isTemp = false

  const createImageRes = await createImage(
    imageFile,
    ownerId,
    ownerModel,
    bucketDir,
    isTemp
  );

  res
    .status(createImageRes.status)
    .json(
      formatApiResponse(
        createImageRes.status,
        createImageRes.statusText,
        createImageRes.msg,
        createImageRes.data || createImageRes.error
      )
    );
});

imageControllers.createTempBlogPostImage = asyncWrapper(
  async (req, res, next) => {
    const {
      file,
      body: { tempId },
    } = req;
    const imageFile = file
    const tempOwnerId = tempId;
    const ownerModel = MODELS.BLOG;
    const bucketDir = FILES_CONFIGS.DIRS.BLOG;
    const isTemp = true;

    const createImageRes = await createImage(
      imageFile,
      tempOwnerId,
      ownerModel,
      bucketDir,
      isTemp
    );
    res
      .status(createImageRes.status)
      .json(
        formatApiResponse(
          createImageRes.status,
          createImageRes.statusText,
          createImageRes.msg,
          createImageRes.data || createImageRes.error
        )
      );
  }
);

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

imageControllers.deleteTempImages = asyncWrapper(async (req, res, next) => {
  //delete from aws s3 bucket
  const tempImages = await Image.find({ isTemp: true });
  console.log("temp images =>>>>>", tempImages);
  const deleteTempImagesPromises = tempImages.map((img) =>
    deleteImageFromDBAndBucket(String(img._id))
  );
  console.log("array images", deleteTempImagesPromises);
  const tempImagesDeletion = await Promise.all(deleteTempImagesPromises);
  
  // Check if any deletion failed
  const noImagesFound = tempImagesDeletion.filter(
    (result) => result.statusText !== STATUS_TEXT.SUCCESS
  );

  return res.status(200).json(
    formatApiResponse(
      200, // to return the response
      STATUS_TEXT.SUCCESS,
      `deleted successfully`,
      {deleted:tempImagesDeletion , notFound:noImagesFound}
    )
  );
});
