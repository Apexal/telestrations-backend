const schema = require('@colyseus/schema')
const { StrokeState } = require('./StrokeState')

/**
 * Represents a submission a player makes each round.
 * Simply consists of their guess at what the previous
 * drawing they are shown is, followed by their drawing
 * which is an attempt to draw what they guessed.
 */
class RoundSubmissionState extends schema.Schema {
  constructor () {
    super()
    this.drawingStrokes = new schema.ArraySchema()
  }
}

schema.defineTypes(RoundSubmissionState, {
  /**
   * Unique client ID of the player who made this submission.
   */
  playerClientId: 'string',
  /**
   * The player's guess of what the drawing they are shown from the previous round is.
   * Their drawing in this round is based on that guess.
   */
  previousDrawingGuess: 'string',
  /**
   * The strokes that make up the drawing. In order of how they were drawn.
   */
  drawingStrokes: [StrokeState]
})

exports.RoundSubmissionState = RoundSubmissionState
