const mongoose = require("mongoose");

// -----------------------------------------------
// Sub-Schemas (localized, nested under ar/en)
// -----------------------------------------------

const InfoSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const SeoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    keywords: [{ type: String, trim: true }],
    ogImage: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const LocalizedSchema = new mongoose.Schema(
  {
    info: { type: InfoSchema, default: () => ({}) },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { _id: false },
);

// -----------------------------------------------
// Sub-Schemas (non-localized, at root level)
// -----------------------------------------------

const ContactSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    x: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    youtube: { type: String, trim: true, default: "" },
    tiktok: { type: String, trim: true, default: "" },
    snapchat: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const MarketingSchema = new mongoose.Schema(
  {
    googleSearchConsole: { type: String, trim: true, default: "" },
    googleTagManager: { type: String, trim: true, default: "" },
    googleMerchant: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const SettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
  },
  { _id: false },
);

// -----------------------------------------------
// Main SiteInfo Schema
// -----------------------------------------------

const SiteInfoSchema = new mongoose.Schema(
  {
    ar: { type: LocalizedSchema, default: () => ({}) },
    en: { type: LocalizedSchema, default: () => ({}) },

    contact: { type: ContactSchema, default: () => ({}) },
    marketing: {
      type: MarketingSchema,
      default: () => ({}),
    },
    settings: { type: SettingsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: false,
  },
);

const SiteInfo = mongoose.model("SiteInfo", SiteInfoSchema);
module.exports = SiteInfo;
