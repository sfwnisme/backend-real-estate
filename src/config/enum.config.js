//----------------------------
// enum values for the entire application
//----------------------------

//deleteit
module.exports = {
  ticketStatus: {
    OPEN: "open",
    IN_PROGRESS: "in-progress",
    RESOLVED: "resolved",
    CLOSED: "closed",
  },
  ticketPriority: {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
  },
  userRoles: {
    ADMIN: "admin",
    AGENT: "agent",
    VIEW_ONLY: "view-only",
  },
};
//------
const enums = module.exports;
enums.PROPERTY_TYPE = {
  HOUSE: "house",
  APPARTMENT: "appartment",
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
  SUMMARY: 'summary',
  SUMMARY_LARGE_IMAGE: 'summary_large_image',
  PLAYER: 'player',
  APP: 'app'
};