const { formatApiResponse } = require("../utils/response");
const { STATUS_TEXT, MODELS } = require("../config/enum.config.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const Property = require("../models/property.model.js");
const Image = require("../models/image.model.js");
const { slugGenerator } = require("../utils/utils.js");
const AppError = require("../utils/appError.js");
const {
  deleteImageFromDBAndBucket,
} = require("../integrations/image.service.js");
const { paginationService } = require("../services/pagination.service.js");
const appError = new AppError();

const propertyControllers = module.exports;

propertyControllers.getProperties = asyncWrapper(async (req, res) => {
  const properties = await Property.find({}, { __v: false }).lean();
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "data fetched successfully",
        properties,
      ),
    );
});

propertyControllers.getPaginatedProperties = asyncWrapper(async (req, res) => {
  const { page, pageSize } = req.query;
  const model = Property;
  const properties = await paginationService(page, pageSize, model);

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "data fetched successfully",
        properties,
      ),
    );
});

propertyControllers.getProperty = asyncWrapper(async (req, res, next) => {
  const { slug } = req.params;
  const property = await Property.findOne({ slug: slug }, { __v: false });

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "operation success",
        property,
      ),
    );
});

propertyControllers.createProperty = asyncWrapper(async (req, res, next) => {
  const { body } = req;
  const generateSlug = slugGenerator(body.title);
  const { tempId, ...rest } = body;
  const tempOwnerId = tempId;
  const isTemp = false;
  console.log("tempId", tempId);
  console.log("rest", rest);
  if (!tempOwnerId) {
    console.log("tempOwnerId undefined, it must be added");
  }

  const createdProperty = new Property({ ...rest, slug: generateSlug });
  const propertyCreation = await createdProperty.save();
  // const findProperty = await Property.findById(propertyCreation._id).lean();
  const propertyId = propertyCreation._id;

  // find image
  const findMany = await Image.find({ ownerId: tempOwnerId });

  if (findMany.length === 0) {
    return res
      .status(201)
      .json(
        formatApiResponse(
          201,
          STATUS_TEXT.SUCCESS,
          "the property created successfully, but the images not found, you can add them by update the blog post",
          propertyCreation,
        ),
      );
  }

  const asignImages = await Image.updateMany(
    { ownerId: tempOwnerId },
    { $set: { ownerId: propertyId, isTemp: isTemp } },
  );

  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        STATUS_TEXT.SUCCESS,
        "The property created successfully",
        propertyCreation,
      ),
    );
});

propertyControllers.updateProperty = asyncWrapper(async (req, res, next) => {
  const {
    body,
    params: { propertyId },
  } = req;

  await Property.updateOne(
    { _id: propertyId },
    { ...body },
    { runValidators: true },
  );
  const updatedProperty = await Property.findById(propertyId);
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "operation success",
        updatedProperty,
      ),
    );
});

propertyControllers.updatePropertySlug = asyncWrapper(
  async (req, res, next) => {
    const { slug, propertyId } = req.body;
    const generateSlug = slugGenerator(slug);
    const propertySlugUpdate = await Property.findByIdAndUpdate(
      propertyId,
      {
        slug: generateSlug,
      },
      { new: true, runValidators: true, select: "slug -_id" },
    );

    res
      .status(200)
      .json(
        formatApiResponse(
          200,
          STATUS_TEXT.SUCCESS,
          "slug updated successfully",
          propertySlugUpdate,
        ),
      );
  },
);

propertyControllers.deleteProperty = asyncWrapper(async (req, res, next) => {
  const ownerId = req.params.propertyId;
  const ownerModel = MODELS.PROPERTY;

  const findPropertyImages = await Image.find({ ownerId, ownerModel });

  const propertyDeletion = await Property.deleteOne({ _id: ownerId });

  if (propertyDeletion.deletedCount === 0) {
    appError.create(400, STATUS_TEXT.FAIL, "property could not be deleted");
    return next(appError);
  }

  if (findPropertyImages.length === 0) {
    return res
      .status(200)
      .json(
        formatApiResponse(
          204,
          STATUS_TEXT.SUCCESS,
          "property deleted, but there is no related images to be deleted",
          propertyDeletion,
        ),
      );
  }

  const propertyImagesArray = findPropertyImages.map((img) => {
    return deleteImageFromDBAndBucket(img._id);
  });

  const propertyImagesDeletion = await Promise.all(propertyImagesArray);

  return res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "property deleted completely",
        { property: propertyDeletion, images: propertyImagesDeletion },
      ),
    );
});
