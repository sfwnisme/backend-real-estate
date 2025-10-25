//----------------------------
// Generate token using user's information
// it will return a generated token and all the important user info
// without the password.
// usage: controllers.register and controllers.login
// note: the controllers.register returns the token, but it should not
//----------------------------

const JWT = require('jsonwebtoken')
const removeObjectKeys = require('./removeObjectKeys')

/**
 * 
 * @param {*} user user data 
 * @param {boolean} returnToken initial: true
 * @returns 
 */
module.exports = (user, returnToken = true) => {
  const returnedUserData = removeObjectKeys(['password'], user.toObject())
  
  // if user register
  if(!returnToken) return returnedUserData
  
  // if user login, token is crucial
  const token = JWT.sign(returnedUserData, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
  return {
    ...returnedUserData,
    token
  }
}