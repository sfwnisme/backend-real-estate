const express = require('express');
const router = express.Router();
const controllers = require('../controllers/property.controllers');
const verifyToken = require('../middlewares/verifyToken');
const authorizedRole = require('../middlewares/authorizedRole');
const userRoles = require('../config/userRoles.config');
const { singlePropertyValidation, createPropertyValidation, updatePropertyValidation, deletePropertyValidation } = require('../../validations/property.validation');
const validationErrorHandlerMiddleware = require('../middlewares/validationErrorHandler.middleware');

router.use(verifyToken)

router.route('/').get(
  authorizedRole(...Object.values(userRoles)),
  controllers.getProperties
)

router.route('/create').post(
  authorizedRole(userRoles.ADMIN, userRoles.MANAGER, userRoles.CSR),
  createPropertyValidation(),
  validationErrorHandlerMiddleware,
  controllers.createProperty
)

router.route('/:slug').get(
  authorizedRole(...Object.values(userRoles)),
  singlePropertyValidation(),
  validationErrorHandlerMiddleware,
  controllers.getProperty
)
router.route('/:propertyId').patch(
  authorizedRole(userRoles.ADMIN, userRoles.MANAGER, userRoles.CSR),
  updatePropertyValidation(),
  validationErrorHandlerMiddleware,
  controllers.updateProperty
)
.delete(
  authorizedRole(userRoles.ADMIN),
  deletePropertyValidation(),
  validationErrorHandlerMiddleware,
  controllers.deleteProperty
)

module.exports = router