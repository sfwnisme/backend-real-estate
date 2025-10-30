const mongoose = require("mongoose");
const {
  BLOG_POST_STATUS,
  OG_TYPES,
  TWITTER_CARD_TYPES,
} = require("../config/enum.config");

// Define the Meta sub-schema (SEO fields)
const MetaSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true, default: "" },
    ogImage: { type: String, trim: true, default: "" },
    ogType: {
      type: String,
      enum: Object.values(OG_TYPES),
      trim: true,
      default: OG_TYPES["ARTICLE"],
    },
    twitterCard: {
      type: String,
      enum: Object.values(TWITTER_CARD_TYPES),
      trim: true,
      default: TWITTER_CARD_TYPES["SUMMARY_LARGE_IMAGE"],
    },
  },
  { _id: false }
); // Do not create an _id for the nested document

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true, // Crucial for SEO URLs
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt/summary is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    coverImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      default: null, // Allow empty if not strictly required
    },
    status: {
      type: String,
      enum: Object.values(BLOG_POST_STATUS),
      required: [true, "Publish status is required"],
      default: "draft",
      index: true,
    },

    // --- NESTED DATA ---

    meta: {
      type: MetaSchema,
      default: {},
    },
    // schemaMarkup: {
    //     type: mongoose.Schema.Types.Mixed, // Use Mixed for flexible JSON-LD object
    //     default: {}
    // },

    // --- NUMERIC & DATES ---
    readingTime: {
      type: String,
      default: "0",
    },
    publishedAt: {
      type: Date,
    },
    updatedAt: {
      // Will be managed by timestamps: true, but explicitly defined here for clarity
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    // collection: 'blog_post' // Optional: Define a custom collection name
    versionKey: false,
  }
);

// Optional: Index on slug and status for fast lookups of published posts
BlogPostSchema.index({ slug: 1, status: 1 });

const BlogPost = mongoose.model("BlogPost", BlogPostSchema);
module.exports = BlogPost;
