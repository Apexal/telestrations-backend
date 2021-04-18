const schema = require('@colyseus/schema')
const { StrokeState } = require('./StrokeState')

/**
 * Represents a submission a player makes each round.
 * Simply consists of their guess at what the previous
 * drawing they are shown is, followed by their drawing
 * which is an attempt to draw what they guessed.
 */
class RoundSubmissionState extends schema.Schema {
  constructor (sessionId, roundIndex, guess, drawingStrokes) {
    super()
    this.roundIndex = roundIndex
    this.playerSessionId = sessionId
    this.previousDrawingGuess = guess
    this.drawingStrokes = new schema.ArraySchema()
    for (const strokeObj of drawingStrokes) {
      this.drawingStrokes.push(new StrokeState(strokeObj))
    }
  }
}

schema.defineTypes(RoundSubmissionState, {
  /**
   * The round this submission is for. (0 being the lobby)
   */
  roundIndex: 'uint8',
  /**
   * Unique client ID of the player who made this submission.
   */
  playerSessionId: 'string',
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
