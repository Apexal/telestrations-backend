const schema = require('@colyseus/schema')
const config = require('../../config')
const MapSchema = schema.MapSchema
const { PlayerState } = require('./PlayerState')

/**
 * Represents the overarching state of a single game room.
 */
class GameRoomState extends schema.Schema {
  constructor () {
    super()
    this.players = new MapSchema()

    // Default to public rooms
    this.isPublic = true

    // Default round to 0 (waiting for players to join and start)
    this.roundIndex = 0

    this.roundTimerSecondsRemaining = config.roundTimerSeconds
  }
}

schema.defineTypes(GameRoomState, {
  /**
   * The maximum number of players allowed in
   * a game room.
   */
  maxPlayers: 'uint8',
  /**
   * The ordered list of players in the game room.
   * Imagine this as a cycle, so if you want the
   * next person after the last,
   * you go back to the first person.
   **/
  players: { map: PlayerState },
  /**
   * The client ID of the host player who started
   * the game room. If they disconnect, this should
   * be reassigned to another client ID.
   */
  hostPlayerClientId: 'string',
  /**
   * Should the room be publicly listed on the homepage?
   * If false, players can only join by entering the room code.
   */
  isPublic: 'boolean',
  /**
   * The round the game is in. 0 means the game has not started and is waiting for players.
   * 1 is the first round. The last round is determined by the number of players.
   */
  roundIndex: 'uint8',
  /**
   * The number of seconds left for players to guess what the previous drawing
   * they are shown is and then submit a drawing themselves.
   */
  roundTimerSecondsRemaining: 'uint16'
})

exports.GameRoomState = GameRoomState
