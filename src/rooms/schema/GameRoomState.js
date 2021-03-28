const schema = require('@colyseus/schema')
const ArraySchema = schema.ArraySchema
const PlayerState = require('./PlayerState')

class GameRoomState extends schema.Schema {
  constructor () {
    super()
    this.players = new ArraySchema()
  }
}

schema.defineTypes(GameRoomState, {
  /**
   * The ordered list of players in the game room.
   * Imagine this as a cycle, so if you want the
   * next person after the last,
   * you go back to the first person.
   **/
  players: [PlayerState],
  /**
   * The room's invite code that players can join with.
   */
  roomCode: 'string',
  /**
   * Should the room be publicly listed on the homepage?
   * If false, players can only join by entering the room code.
   */
  isPublic: 'boolean',
  /**
   * The round the game is in. 0 means the game has not started and is waiting for players.
   * 1 is the first round. The last round is determined by the number of players.
   */
  roundIndex: 'int8'
})

exports.GameRoomState = GameRoomState
