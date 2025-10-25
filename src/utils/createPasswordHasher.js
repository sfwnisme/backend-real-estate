//----------------------------
// password hasher function, using bcrypt
//----------------------------

const bcrypt = require('bcryptjs')
module.exports = (saltNumber = 10) => {
  return async (password) => {
    return await bcrypt.hash(password, saltNumber)
  }
}