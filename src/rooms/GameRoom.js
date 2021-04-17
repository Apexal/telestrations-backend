const colyseus = require('colyseus')
const config = require('../config')
const { validatePlayerDisplayName, generateRoomId, chooseRandomSecretWords } = require('../utils')
const { GameRoomState } = require('./schema/GameRoomState')
const { PlayerState } = require('./schema/PlayerState')
const { RoundSubmissionState } = require('./schema/RoundSubmissionState')

exports.GameRoom = class extends colyseus.Room {
  /**
   * Called when a new game room is created.
   * Sets up the game room state and event
   * handlers for everything that happens
   * in the game.
   *
   * @param {*} options Options from the client
   */
  onCreate (options) {
    this.setState(new GameRoomState())

    // Set room ID to random alphabetic code like 'ABCDE'
    this.roomId = generateRoomId()

    // Set the number of max clients
    this.maxClients = config.maxClients
    this.state.maxPlayers = this.maxClients

    /**
     * Event handler for the `player_set_displayName` event.
     * Updates the player's name and syncs it across all clients.
     */
    this.onMessage('player_set_displayName', (client, { displayName }) => {
      // Sanitize/validate display name
      const result = validatePlayerDisplayName(displayName)
      if (!result) return // Ignore requests to set displayName to something invalid

      const player = this.state.players.get(client.id)
      const oldDisplayName = player.displayName
      player.displayName = result

      console.log(`[Room ${this.roomId}] Client`, client.id, 'changed display name from', oldDisplayName, 'to', displayName)
    })

    /**
     * Handles request to start game from a client. Ensures they are the host before
     * setting up the game to start.
     */
    this.onMessage('start_game', (client) => {
      // Check if client is host
      if (client.id !== this.state.hostPlayerClientId) return

      // Check if min number of players
      if (this.state.players.size < config.minClients) return

      console.log(`[Room ${this.roomId}] Host client ${client.id} wants to start game`)

      // Assign secret words
      const playerKeys = Array.from(this.state.players.keys())
      const secretWords = chooseRandomSecretWords(this.state.players.size)
      secretWords.forEach((secretWord, index) => {
        const player = this.state.players.get(playerKeys[index])

        player.secretWord = secretWord
        console.log(`[Room ${this.roomId}] Client`, playerKeys[index], `(${player.displayName})`, 'received secret word', "'" + secretWord + "'")
      })

      // Set the round to Round 1
      this.state.roundIndex = 1

      // Lock room so no new clients
      this.lock()
    })

    /** Handles submission from clients. Must verify them before adding them to the state. */
    this.onMessage('player_submit_submission', (client, { roundIndex, previousDrawingGuess, drawingStrokes }) => {
      const newRoundSubmission = new RoundSubmissionState(client.sessionId, roundIndex, previousDrawingGuess, drawingStrokes)

      // Check if player has already submitted for this round
      if (!this.state.players[client.sessionId].submissions.find(sub => sub.roundIndex === roundIndex)) {
        this.state.players[client.sessionId].submissions.push(newRoundSubmission)

        console.log(
          `[Room ${this.roomId}] Client`,
          client.sessionId,
          'made submission for round',
          roundIndex,
          `with previous drawing guess '${previousDrawingGuess}' and drawing with ${drawingStrokes.length} strokes`
        )
      } else {
        console.log(
          `[Room ${this.roomId}] Client`,
          client.sessionId,
          'attempted to make a double submission for round',
          roundIndex,
          'but was ignored'
        )
      }
    })
  }

  /**
   * Called when a new client joins the room.
   *
   * @param {colyseus.Client} client
   * @param {*} options
   */
  onJoin (client, options) {
    this.state.players.set(client.sessionId, new PlayerState())
    console.log(`[Room ${this.roomId}] Client`, client.id, 'joined')

    // Set player as host if no host yet (player who created game becomes host)
    if (!this.state.hostPlayerClientId) this.state.hostPlayerClientId = client.id
  }

  /**
   * Called when a client leaves the room, either intentionally or not.
   *
   * @param {colyseus.Client} client The client that disconnected
   * @param {boolean} consented Whether the disconnect was intentional
   */
  onLeave (client, consented) {
    // TODO: implement reconnect waiting only if not consented
    if (this.state.players.has(client.sessionId)) {
      // Remove their player state
      this.state.players.delete(client.sessionId)

      // Choose a new host if necessary
      if (client.id === this.state.hostPlayerClientId) {
        const iter = this.state.players.keys()
        this.state.hostPlayerClientId = iter.next().value
        console.log(`[Room ${this.roomId}] Host leaving, chose client`, this.state.hostPlayerClientId, 'as new host')
      }
    }
    console.log(`[Room ${this.roomId}] Client`, client.id, 'left')
  }

  onDispose () {
    console.log(`[Room ${this.roomId}] Room empty, destroyed`)
  }
}
