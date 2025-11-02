const { USER_ROLES } = require("../config/enum.config.js");
const User = require("../models/user.model");
const { formatApiResponse } = require("../utils/response");
const { STATUS_TEXT } = require("../config/enum.config.js");
const createPasswordHasher = require("../utils/createPasswordHasher.js");
const hashPassword = createPasswordHasher(10);
const AppError = require("../utils/appError.js");
const asyncWrapper = require("../middlewares/asyncWrapper.js");
const bcrypt = require("bcryptjs");
const generateAuthResponse = require("../utils/generateAuthResponse.js");
const { removeObjectKeys } = require("../utils/utils.js");
const appError = new AppError();

const userControllers = module.exports;

userControllers.getAllUsers = asyncWrapper(async (req, res) => {
  const allUsers = await User.find({}, { __v: false, password: false });
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "data fetched successfully",
        allUsers,
      ),
    );
});

userControllers.getSingleUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const findUser = await User.findOne({ _id: userId }).select("-password");

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "operation success",
        findUser,
      ),
    );
});

userControllers.getCurrentUser = asyncWrapper(async (req, res, next) => {
  const currentUser = req.user;
  console.log(currentUser);

  const user = removeObjectKeys(["iat", "exp"], currentUser);
  res
    .status(200)
    .json(formatApiResponse(200, STATUS_TEXT.SUCCESS, "success", user));
});

userControllers.register = asyncWrapper(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await hashPassword(password);
  const registeredUser = new User({
    name,
    email,
    password: hashedPassword,
    role: role || USER_ROLES.VIEW_ONLY,
  });
  await registeredUser.save();
  const authUser = generateAuthResponse(registeredUser, false);
  res
    .status(201)
    .json(
      formatApiResponse(
        201,
        STATUS_TEXT.SUCCESS,
        "the user created successfully",
        authUser,
      ),
    );
});

userControllers.login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }, { __v: false });
  const passwordIsMatch = await bcrypt.compare(password, user.password);

  if (user && !passwordIsMatch) {
    appError.create(401, STATUS_TEXT.FAIL, "password is not correct");
    return next(appError);
  }

  const authUser = generateAuthResponse(user);
  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "operation success",
        authUser,
      ),
    );
});

userControllers.updateUser = asyncWrapper(async (req, res, next) => {
  const {
    body,
    params: { userId },
  } = req;

  const updatedFields = { ...body };
  if (body.password) {
    const updatedPassword = await hashPassword(body.password);
    updatedFields.password = updatedPassword;
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { ...updatedFields },
    { new: true, runValidators: true, select: "-password" },
  );

  res
    .status(200)
    .json(
      formatApiResponse(
        200,
        STATUS_TEXT.SUCCESS,
        "operation success",
        updatedUser,
      ),
    );
});

userControllers.deleteUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  const deletedUser = await User.deleteOne({ _id: userId });
  return res
    .status(200)
    .json(
      formatApiResponse(
        204,
        STATUS_TEXT.SUCCESS,
        "delete successfully",
        deletedUser,
      ),
    );
});
