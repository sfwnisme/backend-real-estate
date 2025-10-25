const express = require('express');
const router = express.Router();
const controllers = require('../controllers/user.controllers');
const { registerValidation, loginValidation, updateUserValidation } = require('../middlewares/validationSchema');
const verifyToken = require('../middlewares/verifyToken');
const authorizedRole = require('../middlewares/authorizedRole');
const userRoles = require('../config/userRoles.config')

// router.use(verifyToken)

router.route('/')
  .get(
    verifyToken,
    authorizedRole(...Object.values(userRoles)),
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
    authorizedRole(userRoles.ADMIN, userRoles.MANAGER),
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
    authorizedRole(userRoles.ADMIN, userRoles.MANAGER),
    updateUserValidation(),
    controllers.updateUser
  )
  .delete(
    verifyToken,
    authorizedRole(userRoles.ADMIN),
    controllers.deleteUser
  )

module.exports = router