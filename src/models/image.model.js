const mongoose = require("mongoose");
const { MODELS } = require("../config/enum.config");

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
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
