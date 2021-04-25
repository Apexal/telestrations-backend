const schema = require('@colyseus/schema')
const { generatePlayerName } = require('../../utils')
const { RoundSubmissionState } = require('./RoundSubmissionState')

/**
 * Represents a player in a specific game room.
 */
class PlayerState extends schema.Schema {
  constructor () {
    super()
    this.displayName = generatePlayerName()
    this.secretWord = ''
    this.submissions = new schema.MapSchema()
    this.connected = true
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
   * The player's submissions in a map.
   * Each submissions stores their guess and their drawing.
   * The key is the roundIndex and the value is the submission.
   */
  submissions: { map: RoundSubmissionState },
  /**
   * Whether the player is connected or not. Can be false if they
   * dropped accidentally and we want to hold their spot for a while.
   */
  connected: 'boolean'
})

exports.PlayerState = PlayerState
