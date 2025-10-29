const {USER_ROLES} = require('../config/enum.config.js')
const User = require('../models/user.model')
const { formatApiResponse } = require('../utils/response');
// const response = require('../utils/response')
const { STATUS_TEXT } = require('../config/enum.config.js')
const createPasswordHasher = require('../utils/createPasswordHasher.js')
const hashPassword = createPasswordHasher(10)
const AppError = require('../utils/appError.js')
const asyncWrapper = require('../middlewares/asyncWrapper.js')
const bcrypt = require('bcryptjs')
const { validationResult, matchedData } = require('express-validator')
const generateAuthResponse = require('../utils/generateAuthResponse.js');
const { removeObjectKeys } = require('../utils/utils.js');
const appError = new AppError()

const getAllUsers = asyncWrapper(
  async (req, res) => {
    const allUsers = await User.find({}, { '__v': false, 'password': false })
    res.status(200).json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        'data fetched successfully',
        allUsers
      ))
  }
)

const getSingleUser = asyncWrapper(
  async (req, res, next) => {
    const { userId } = req.params
    const user = await User.findOne({ _id: userId }).select("-password")
    if (!user) {
      appError.create(400, STATUS_TEXT.FAIL, "The requested user account doesn't exist. Kindly reach out to your administrator to create one.")
      return next(appError)
    }
    console.log('decoded+++++++++++', req.user)
    res.status(200).json(formatApiResponse(200, STATUS_TEXT.SUCCESS, "operation success", user))
  }
)

const getCurrentUser = asyncWrapper(
  async (req, res, next) => {
    // const currentUser = req.body.user
    const currentUser = req.user
    console.log(currentUser)

    const user = removeObjectKeys(['iat', 'exp'], currentUser)
    res.status(200).json(formatApiResponse(200, STATUS_TEXT.SUCCESS, 'success', user))
    // next()
  }
)

const register = asyncWrapper(
  async (req, res, next) => {
    const { name, email, password, role } = req.body
    const errors = validationResult(req);

    const user = await User.findOne({ email })
    if (user) {
      appError.create(400, STATUS_TEXT.FAIL, "The requested user account already exist. Kindly try another email address")
      return next(appError)
    }


    if (!errors.isEmpty()) {
      appError.create(400, STATUS_TEXT.FAIL, errors.array())
      return next(appError)
    }

    const hashedPassword = await hashPassword(password)

    const registeredUser = new User({ name, email, password: hashedPassword, role: role || USER_ROLES.VIEW_ONLY })
    await registeredUser.save()
    const authUser = generateAuthResponse(registeredUser, false)
    res.status(201).json(formatApiResponse(201, STATUS_TEXT.SUCCESS, 'the user created successfully', authUser))
  }
)

const login = asyncWrapper(
  async (req, res, next) => {
    const { email, password } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      appError.create(400, STATUS_TEXT.FAIL, errors.array())
      return next(appError)
    }

    let user = await User.findOne({ email }, { "__v": false })

    if (!user) {
      appError.create(400, STATUS_TEXT.FAIL, "The requested user account doesn't exist. Kindly reach out to your administrator to create one.")
      return next(appError)
    }

    const passwordIsMatch = await bcrypt.compare(password, user.password)

    if (user && !passwordIsMatch) {
      appError.create(401, STATUS_TEXT.FAIL, 'password is not correct')
      return next(appError)
    }

    const authUser = generateAuthResponse(user)
    res.status(200).json(formatApiResponse(200, STATUS_TEXT.SUCCESS, 'operation success', authUser))
  }
)

const updateUser = asyncWrapper(
  async (req, res, next) => {
    const { body, params: { userId } } = req;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      appError.create(400, STATUS_TEXT.FAIL, errors.array())
      return next(appError)
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      appError.create(404, STATUS_TEXT.FAIL, `user [ ${userId} ] is not exist`)
      return next(appError)
    }

    let updatedFields = { ...body };
    if (body.password) {
      let updatedPassword = await hashPassword(body.password)
      updatedFields.password = updatedPassword
    }

    const updatedUser = await User.updateOne({ _id: userId }, { ...updatedFields }, { runValidators: true })
    const isUpdated = updatedUser.modifiedCount > 0

    // this condition does not working
    if (!isUpdated) {
      appError.create(400, STATUS_TEXT.FAIL, 'no changes made')
      return next(appError)
    }

    res.status(200).json(formatApiResponse(200, STATUS_TEXT.SUCCESS, "operation success", updatedUser))
  }
)


const deleteUser = asyncWrapper(
  async (req, res) => {
    const { userId } = req.params
    const user = await User.findOne({ _id: userId })
    if (!user) {
      res.status(401).json(formatApiResponse(401, STATUS_TEXT.FAIL, "user not exist"))
    }

    const deletedUser = await User.deleteOne({ _id: userId })
    return res.status(200).json(formatApiResponse(200, STATUS_TEXT.SUCCESS, 'delete successfully', deletedUser))
  }
)

const deleteUsers = asyncWrapper(
  async (req, res) => {
    const { userIds } = req.body
    if (userIds.length === 0 || !Array.isArray(userIds)) {
      res.status(401).json(formatApiResponse(401, STATUS_TEXT.FAIL, "no user ids exist"))
    }
    const deletedUsers = await User.deleteMany({ _id: { $in: userIds } })
    return res.status(200).json(formatApiResponse(200, STATUS_TEXT.SUCCESS, 'delete successfully', deletedUsers))
  }
)

module.exports = {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  register,
  login,
  updateUser,
  deleteUser,
  deleteUsers,
}