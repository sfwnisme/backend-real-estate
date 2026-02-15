const express = require("express");
const router = express.Router();
const controllers = require("../controllers/site-info.controllers");
const verifyToken = require("../middlewares/verifyToken");
const authorizedRole = require("../middlewares/authorizedRole");
const { USER_ROLES } = require("../config/enum.config");
const validationErrorHandlerMiddleware = require("../middlewares/validationErrorHandler.middleware");
const {
  createSiteInfoValidation,
  updateSiteInfoValidation,
} = require("../validations/site-info.validation");

// GET /api/site-info - Public
router.route("/").get(controllers.getSiteInfo);

// POST /api/site-info - Admin/Manager only
router.route("/").post(
  verifyToken,
  authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  createSiteInfoValidation(),
  validationErrorHandlerMiddleware,
  controllers.createSiteInfo
);

// PATCH /api/site-info - Admin/Manager only
router.route("/update").patch(
  verifyToken,
  authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  updateSiteInfoValidation(),
  validationErrorHandlerMiddleware,
  controllers.updateSiteInfo
);

// DELETE /api/site-info - Admin only
router.route("/").delete(
  verifyToken,
  authorizedRole(USER_ROLES.ADMIN),
  controllers.deleteSiteInfo
);

module.exports = router;
