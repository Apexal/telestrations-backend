const schema = require('@colyseus/schema')

class DrawingState extends schema.Schema {}

schema.defineTypes(DrawingState, {
})

exports.DrawingState = DrawingState
