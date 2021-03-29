const schema = require('@colyseus/schema')
const { DrawingState } = require('./DrawingState')

class PlayerState extends schema.Schema {}

schema.defineTypes(PlayerState, {
  /**
   * The public-facing display name of the user. Can be changed before a game starts.
   */
  displayName: 'string',
  /**
   * The randomly selected secret word assigned to this user.
   */
  secretWord: 'string',
  drawingChain: [DrawingState]
})

exports.PlayerState = PlayerState
