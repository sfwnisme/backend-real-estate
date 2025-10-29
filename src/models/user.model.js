const mongoose = require('mongoose');
const validator = require('validator');
const { USER_ROLES } = require('../config/enum.config');
// const USER_ROLES = require("../config/enums.config")
// const USER_ROLES = require('../config/enums.config.js')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "must be a valid email"]
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.VIEW_ONLY
  }
},
  {
    timestamps: true
  }
)

module.exports = mongoose.model("User", userSchema)
