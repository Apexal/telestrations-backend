const schema = require('@colyseus/schema')
const ArraySchema = schema.ArraySchema
const PlayerState = require('./PlayerState')

class MyRoomState extends schema.Schema {
  constructor () {
    super()
    this.players = new ArraySchema()
  }
}

schema.defineTypes(MyRoomState, {
  players: [PlayerState]
})

exports.MyRoomState = MyRoomState
