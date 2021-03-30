const schema = require('@colyseus/schema')
const { RoundSubmissionState } = require('./RoundSubmissionState')

/**
 * Represents a player in a specific game room.
 */
class PlayerState extends schema.Schema {
  constructor () {
    super()
    this.displayName = 'Unnamed Player'
    this.secretWord = ''
  }
}

schema.defineTypes(PlayerState, {
  /**
   * The public-facing display name of the user. Can be changed before a game starts.
   */
  displayName: 'string',
  /**
   * The randomly selected secret word assigned to this user.
   */
  secretWord: 'string',
  /**
   * The player's submissions in an ordered array.
   * Each submissions stores their guess and their drawing.
   */
  submissions: [RoundSubmissionState]
})

exports.PlayerState = PlayerState
