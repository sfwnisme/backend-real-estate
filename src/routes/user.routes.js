const express = require('express');
const router = express.Router();
const controllers = require('../controllers/user.controllers');
const { registerValidation, loginValidation, updateUserValidation } = require('../middlewares/validationSchema');
const verifyToken = require('../middlewares/verifyToken');
const authorizedRole = require('../middlewares/authorizedRole');
const {USER_ROLES} = require('../config/enum.config')

// router.use(verifyToken)

router.route('/')
  .get(
    verifyToken,
    authorizedRole(...Object.values(USER_ROLES)),
    controllers.getAllUsers
  )

router.route('/me')
  .get(
    verifyToken,
    controllers.getCurrentUser
  )

router.route('/register')
  .post(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    registerValidation(),
    controllers.register
  )

router.route('/login')
  .post(
    loginValidation(),
    controllers.login
  )

router.route('/:userId')
  .get(
    verifyToken,
    controllers.getSingleUser
  )
  .patch(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    updateUserValidation(),
    controllers.updateUser
  )
  .delete(
    verifyToken,
    authorizedRole(USER_ROLES.ADMIN),
    controllers.deleteUser
  )

module.exports = router