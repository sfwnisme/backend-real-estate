// models/ticket.model.js
const mongoose = require("mongoose");
const { PROPERTY_TYPE, PROPERTY_STATUS } = require("../config/enum.config");

const propertySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    propertySize: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: false,
    },
    bathrooms: {
      type: Number,
      required: false,
    },
    garage: {
      type: Number,
      required: false,
    },
    garageSize: {
      type: Number,
      required: false,
    },
    yearBuilt: {
      type: Number,
      required: true,
    },
    propertyType: {
      type: String,
      enum: Object.values(PROPERTY_TYPE),
      required: true,
    },
    propertyStatus: {
      type: String,
      enum: Object.values(PROPERTY_STATUS),
      required: true,
      default: PROPERTY_STATUS.FOR_SALE,
    },
    features: {
      type: String,
      required: false,
    },
    video: {
      type: String,
      required: false,
      default: "",
    },
    hide: {
      type: Boolean,
      required: false,
      default: false,
    },
    address: {
      country: { type: String, required: false },
      state: { type: String, required: false },
      city: { type: String, required: false },
      area: { type: String, required: false },
      zipCode: { type: String, required: false },
      other: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);
