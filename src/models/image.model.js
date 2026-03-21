const mongoose = require("mongoose");
const { MODELS, IMAGE_ROLES, IMAGE_TAGS } = require("../config/enum.config");

const ALL_IMAGE_ROLES = Object.values(IMAGE_ROLES).flatMap((m) =>
  Object.values(m)
);
const ALL_IMAGE_TAGS = Object.values(IMAGE_TAGS);

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    ownerModel: {
      type: String,
      require: true,
      enum: Object.values(MODELS),
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "ownerModel",
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },
    isTemp: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: [...ALL_IMAGE_ROLES, null],
      default: null,
    },
    tag: {
      type: String,
      enum: [...ALL_IMAGE_TAGS, null],
      default: null,
    },
    alt: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

imageSchema.index(
  { ownerId: 1, ownerModel: 1, role: 1, tag: 1 },
  { unique: true, partialFilterExpression: { role: { $ne: null } } }
);

module.exports = mongoose.model("Image", imageSchema);
