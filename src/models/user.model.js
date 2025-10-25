const mongoose = require('mongoose');
const validator = require('validator')
const userRoles = require('../config/userRoles.config')

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
    enum: Object.values(userRoles),
    default: userRoles.VIEW_ONLY
  }
},
  {
    timestamps: true
  }
)

module.exports = mongoose.model("User", userSchema)
