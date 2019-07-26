const User = require('../models/Users')
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)

exports.findOrCreateUser = async token => {
  // verify auth token
  const googleUser = await verifyAuthToken(token)
  // check if user exists
  const user = await checkIfUserExists(googleUser.email)
  // if user exists return user, otherwise create new user
  return user ? user : createNewUser(googleUser)
}

const verifyAuthToken = async token => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.OAUTH_CLIENT_ID
    })

    return ticket.getPayload()
  } catch (err) {
    console.err('Error verifying auth token', err)
  }
}

// exec() - to return a promise
const checkIfUserExists = async email => await User.findOne({ email }).exec()

const createNewUser = googleUser => {
  const { email, name, picture } = googleUser
  const user = { email, name, picture }

  return new User(user).save()
}
