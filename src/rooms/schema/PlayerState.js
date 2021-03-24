const schema = require('@colyseus/schema')

class PlayerState extends schema.Schema {}

schema.defineTypes(PlayerState, {
  displayName: 'string'
})

exports.PlayerState = PlayerState
