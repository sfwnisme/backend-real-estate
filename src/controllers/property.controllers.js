const { formatApiResponse } = require("../utils/response");
const { STATUS_TEXT } = require("../config/enum.config.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const Property = require("../models/property.model.js");
const { slugGenerator } = require("../utils/utils.js");

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
        properties
      )
    );
});

propertyControllers.getProperty = asyncWrapper(async (req, res, next) => {
  const { slug } = req.params;
  const property = await Property.findOne({ slug: slug }, { __v: false });

  res
    .status(200)
    .json(
      formatApiResponse(200, STATUS_TEXT.SUCCESS, "operation success", property)
    );
});

propertyControllers.createProperty = asyncWrapper(async (req, res, next) => {
  const { body } = req;
  const generateSlug = slugGenerator(body.title);

  const createdProperty = new Property({ ...body, slug: generateSlug });
  await createdProperty.save();
  const propertyCreation = await Property.findById(createdProperty._id).lean();

  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        STATUS_TEXT.SUCCESS,
        "The property created successfully",
        propertyCreation
      )
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
    { runValidators: true }
  );
  const updatedProperty = await Property.findById(propertyId);
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "operation success",
        updatedProperty
      )
    );
});

propertyControllers.deleteProperty = asyncWrapper(async (req, res, next) => {
  const { propertyId } = req.params;

  const deletedProperty = await Property.deleteOne({ _id: propertyId });
  return res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "property deleted successfully",
        deletedProperty
      )
    );
});
