const { AuthenticationError } = require('apollo-server')
const Pin = require('./models/Pin')

const authenticated = next => (root, args, ctx, info) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError('You must be logged in!')
  } else {
    return next(root, args, ctx, info)
  }
}

module.exports = {
  Query: {
    me: authenticated(async (root, args, ctx, info) => ctx.currentUser),
    getPins: async (root, args, ctx, info) => {
      const pins = await Pin.find({})
        .populate('author')
        .populate('comments.author')
      return pins
    }
  },

  Mutation: {
    createPin: authenticated(async (root, args, ctx) => {
      const newPin = await new Pin({
        ...args.input,
        author: ctx.currentUser._id
      }).save()
      const pinAdded = await Pin.populate(newPin, 'author')
      return pinAdded
    }),
    deletePin: authenticated(async (root, { pinId }, ctx) => {
      const pinDelete = await Pin.findOneAndDelete({ _id: pinId }).exec()
      return pinDelete
    })
  }
}
