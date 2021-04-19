const schema = require('@colyseus/schema')

/**
 * Represents a single stroke of a drawing.
 */
class StrokeState extends schema.Schema {
  constructor (strokeObject) {
    super()

    this.fromX = strokeObject.fromX
    this.fromY = strokeObject.fromY
    this.toX = strokeObject.toX
    this.toY = strokeObject.toY
    this.width = strokeObject.width
    this.color = strokeObject.color
  }
}

schema.defineTypes(StrokeState, {
  /** The x coordinate of the start of the stroke. */
  fromX: 'number',
  /** The y coordinate of the start of the stroke. */
  fromY: 'number',
  /** The x coordinate of the end of the stroke. */
  toX: 'number',
  /** The y coordinate of the end of the stroke. */
  toY: 'number',
  /** The width of the stroke. */
  width: 'uint8',
  /** The color of the stroke. */
  color: 'string'
})

exports.StrokeState = StrokeState
