const schema = require('@colyseus/schema')

class PlayerState extends schema.Schema {}

schema.defineTypes(PlayerState, {
  /**
   * The public-facing display name of the user. Can be changed before a game starts.
   */
  displayName: 'string',
  /**
   * The randomly selected secret word assigned to this user.
   */
  secretWord: 'string'
})

exports.PlayerState = PlayerState
