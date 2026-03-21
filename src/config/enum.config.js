//----------------------------
// enum values for the entire application
//----------------------------

const enums = module.exports;

enums.STATUS_TEXT = {
  SUCCESS: "success",
  FAIL: "fail",
  ERROR: "error",
};

enums.USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CONTENT: "content",
  VIEW_ONLY: "view_only",
};

enums.PROPERTY_TYPE = {
  HOUSE: "house",
  APARTMENT: "apartment",
  VILLA: "villa",
  STUDIO: "studio",
  CHALET: "chalet",
};
enums.PROPERTY_STATUS = {
  FOR_SALE: "for_sale",
  FOR_RENT: "for_rent",
  SOLD: "sold",
  RENTED: "rented",
};
enums.BLOG_POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

enums.OG_TYPES = {
  // 1. General Website and Core Content
  WEBSITE: "website", // For Homepages, Search Results, About Us, etc.
  ARTICLE: "article", // For Blog Posts (as you are currently using)
  PROFILE: "profile", // For user profile pages (agents, users)
  // 2. Real Estate Specific (Using 'place' and 'product' concepts)
  // NOTE: There is no official 'real_estate' type; 'product' or 'place' are used.
  PRODUCT: "product", // A strong option for listings (e.g., a house for sale)
  PLACE: "place", // For the location of a specific property or office
  // 3. Business Information
  BUSINESS: "business.business", // For the 'About Us' page or company profile
  // 4. Media (If you share video tours)
  VIDEO_MOVIE: "video.movie", // For full-length property tours
  VIDEO_CLIP: "video.other", // For short video clips or reels
};

enums.TWITTER_CARD_TYPES = {
  SUMMARY: "summary",
  SUMMARY_LARGE_IMAGE: "summary_large_image",
  PLAYER: "player",
  APP: "app",
};

enums.FILES_CONFIGS = {
  DIRS: {
    DEFAULT: "default/",
    IMAGES: "images/",
    PROPERTIES: "properties/",
    SITE_INFO: "site-info/",
    SERVICES: "services/",
    BLOG: "blog/",
  },
  IMAGE: {
    MAX_SIZE: 3,
    MAX_LENGTH: 2,
  },
  PDF: {
    MAX_SIZE: 6,
    MAX_LENGTH: 2,
  },
};

// mandatory: values must be the same as the model name
enums.MODELS = {
  PROPERTY: "Property",
  BLOG_POST: "BlogPost",
  USER: "User",
  SITE_INFO: "SiteInfo",
};

enums.IMAGE_ROLES = {
  SITE_INFO: {
    ICON: "icon",
    LOGO: "logo",
    OG_IMAGE: "og-image",
  },
  // future: PROPERTY: { FLOOR_PLAN: "floor-plan" }, etc.
};

enums.IMAGE_TAGS = {
  THEME_DARK: "theme_dark",
  THEME_DEFAULT: "theme_default",
};

enums.IMAGE_ROLE_CONSTRAINTS = {
  icon: {
    mimeTypes: ["image/png", "image/x-icon", "image/vnd.microsoft.icon"],
    maxFileSize: 1,
    dimensions: [
      { width: 16, height: 16 },
      { width: 32, height: 32 },
      { width: 48, height: 48 },
      { width: 192, height: 192 },
    ],
  },
  logo: {
    mimeTypes: ["image/png", "image/svg+xml"],
    maxFileSize: 2,
    minWidth: 200,
    minHeight: 200,
    maxWidth: 500,
    maxHeight: 500,
  },
  "og-image": {
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 3,
    recommendedWidth: 1200,
    recommendedHeight: 630,
  },
};
