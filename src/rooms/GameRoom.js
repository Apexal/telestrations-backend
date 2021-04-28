const colyseus = require('colyseus')
const e = require('cors')
const config = require('../config')
const { validatePlayerDisplayName, generateRoomId, chooseRandomSecretWords } = require('../utils')
const { GameRoomState } = require('./schema/GameRoomState')
const { PlayerState } = require('./schema/PlayerState')
const { RoundSubmissionState } = require('./schema/RoundSubmissionState')

exports.GameRoom = class extends colyseus.Room {
  /**
   * Setup the game to start. Assign secret words,
   * lock room, and start the clock.
   */
  startGame () {
    // Assign secret words
    this.assignRandomSecretWords()

    // Lock room so no new clients
    this.lock()

    this.startNextRound()
  }

  /**
   * Ends the current round by clearing the clock, broadcasting
   * a `round-end` message and deciding whether to end the game
   * or start the next round.
   */
  endRound () {
    this.clock.clear()
    this.broadcast('round-end', { roundIndex: this.state.roundIndex })
    console.log(`[Room ${this.roomId}] Round ${this.state.roundIndex} over`)

    if (this.state.roundIndex === this.state.players.size + this.state.players.size % 2) {
      this.endGame()
    } else {
      this.startNextRound()
    }
  }

  /**
   * Start the next round by incrementing roundIndex,
   * resetting timers, and starting the clock again.
   */
  startNextRound () {
    this.state.roundIndex += 1
    console.log(`[Room ${this.roomId}] Starting round ${this.state.roundIndex}`)

    // Reset timer but not clock
    this.state.roundTimerSecondsRemaining = config.roundTimerSeconds

    this.clock.start()

    this.delayedInterval = this.clock.setInterval(() => {
      if (this.state.roundTimerSecondsRemaining > 0) {
        this.state.roundTimerSecondsRemaining -= 1
      }

      if (this.state.roundTimerSecondsRemaining === 0) {
        this.clock.clear()

        // Make submissions for disconnected players
        this.state.players.forEach((player, sessionId) => {
          if (player.connected) return

          if (!this.findPlayerSubmission(player, this.state.roundIndex)) {
            const newRoundSubmission = new RoundSubmissionState(sessionId, this.state.roundIndex, '', [])
            player.submissions.set(this.state.roundIndex, newRoundSubmission)
            console.log(`[Room ${this.roomId}] Made empty submission for disconnected player ${sessionId}`)
          }
        })

        // Tell all clients to send submissions NOW even if users aren't done
        this.broadcast('send-submissions', { roundIndex: this.state.roundIndex })
        console.log(`[Room ${this.roomId}] Demanding final submissions from all clients`)
      }
    }, 1000)
  }

  /**
   * Mark game as over by updating game state.
   */
  endGame () {
    console.log(`[Room ${this.roomId}] Game over, end of flow`)
    this.state.isGameOver = true
    this.broadcast('game-over')
  }

  /**
   * Choose random words from the dictionary and assign them to
   * every player in the game state.
   */
  assignRandomSecretWords () {
    // Assign secret words
    const playerKeys = Array.from(this.state.players.keys())
    const secretWords = chooseRandomSecretWords(this.state.players.size)
    secretWords.forEach((secretWord, index) => {
      const player = this.state.players.get(playerKeys[index])

      player.secretWord = secretWord
      console.log(`[Room ${this.roomId}] Client`, playerKeys[index], `(${player.displayName})`, 'received secret word', "'" + secretWord + "'")
    })
  }

  /**
   * Handle receiving a round submission from a client.
   * Ignores repeated submissions and logs appropriately.
   *
   * @param {colyseus.Client} client 
   * @param {number} roundIndex 
   * @param {string} previousDrawingGuess
   * @param {object[]} drawingStrokes 
   */
  handleSubmission (client, roundIndex, previousDrawingGuess, drawingStrokes) {
    const player = this.state.players.get(client.sessionId)

    // Check if player has already submitted for this round
    if (!this.findPlayerSubmission(player, roundIndex)) {
      const newRoundSubmission = new RoundSubmissionState(client.sessionId, roundIndex, previousDrawingGuess, drawingStrokes)

      // Store round submission
      player.submissions.push(newRoundSubmission)

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
  }

  /**
   * Change a client's displayName and log it.
   *
   * @param {colyseus.Client} client
   * @param {string} newDisplayName
   **/
  handleDisplayNameChange (client, newDisplayName) {
    const player = this.state.players.get(client.id)
    const oldDisplayName = player.displayName
    player.displayName = newDisplayName

    console.log(`[Room ${this.roomId}] Client`, client.id, 'changed display name from', oldDisplayName, 'to', newDisplayName)
  }
/**
   * Set the visibility of the game room in both state
   * and metadata so the lobby page can filter private rooms.
   *
   * @param {boolean} isPublic
   */
 handleSetRoomVisibility (isPublic) {
  this.state.isPublic = isPublic

  this.setPrivate(!isPublic).then(() => colyseus.updateLobby(this))

  console.log(`[Room ${this.roomId}] Host client`, this.state.hostPlayerSessionId, 'set room visibility to', isPublic ? 'public' : 'private')
}
  findPlayerSubmission (player, roundIndex) {
    return player.submissions.find(sub => sub.roundIndex === roundIndex)
  }

  /**
   * Check whether every player has submitted for a given round.
   *
   * @param {number} roundIndex
   * @return {boolean}
   */
  haveAllPlayersSubmitted (roundIndex) {
    return [...this.state.players.values()].every(player => this.findPlayerSubmission(player, roundIndex))
  }

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
      if (!result) {
        client.send('error', 'You can\'t use that name!')
        return
      } // Ignore requests to set displayName to something invalid

      this.handleDisplayNameChange(client, result)
    })

    /**
     * Event handler for the `set_room_visibility` event.
     * Updates the room visibility. Only allows host to send this.
     */
     this.onMessage('set_room_visibility', (client, { isPublic }) => {
      if (client.id !== this.state.hostPlayerSessionId) return

      this.handleSetRoomVisibility(isPublic)
    })
    
    /**
     * Handles request to start game from a client. Ensures they are the host before
     * setting up the game to start.
     */
    this.onMessage('start_game', (client) => {
      // Check if client is host
      if (client.id !== this.state.hostPlayerSessionId) return

      // Check if min number of players
      if (this.state.players.size < config.minClients) {
        client.send('error', `Not enough players (${config.minClients} required)`)
        return
      }

      console.log(`[Room ${this.roomId}] Host client ${client.id} wants to start game`)

      this.startGame()
    })

    /** Handles submission from clients. Must verify them before adding them to the state. */
    this.onMessage('player_submit_submission', (client, { roundIndex, previousDrawingGuess, drawingStrokes }) => {
      this.handleSubmission(client, roundIndex, previousDrawingGuess, drawingStrokes)

      // Check if all players are submitted
      if (this.haveAllPlayersSubmitted(roundIndex)) {
        console.log(`[Room ${this.roomId}] All clients submitted, ending round and continuing to next`)
        this.endRound()
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
    if (this.state.players.has(client.sessionId)) {
      // Reconnected! Woo!
      console.log(`[Room ${this.roomId}] Client`, client.id, 'rejoined')
      this.state.players.get(client.sessionId).connected = true
    } else {
      // New connection
      this.state.players.set(client.sessionId, new PlayerState())
      console.log(`[Room ${this.roomId}] Client`, client.id, 'joined')
    }

    // Set player as host if no host yet (player who created game becomes host)
    if (!this.state.hostPlayerSessionId) this.state.hostPlayerSessionId = client.id
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
      // Remove their player state IF GAME HASN'T STARTED YET
      if (this.state.roundIndex === 0) {
        this.state.players.delete(client.sessionId)
        console.log(`[Room ${this.roomId}] Client`, client.id, 'left before start, deleting player state')

        // Choose a new host if necessary
        if (client.id === this.state.hostPlayerSessionId && this.state.players.size > 0) {
          const iter = this.state.players.keys()
          this.state.hostPlayerSessionId = iter.next().value
          console.log(`[Room ${this.roomId}] Host leaving, chose client`, this.state.hostPlayerSessionId, 'as new host')
        }
      } else {
        // PLAYER LEFT MID-GAME, ALLOW RECONNECTION
        this.state.players.get(client.sessionId).connected = false
        console.log(`[Room ${this.roomId}] Client`, client.id, 'left mid-game, keeping player state and allow reconnection for 1 minute')

        if (!consented) {
          this.allowReconnection(client, 60)
            .then(() => {
              this.state.players.get(client.sessionId).connected = true
              console.log(`[Room ${this.roomId}] Client`, client.id, 'rejoined mid-game')
            })
            .catch(err => {
              console.log(`[Room ${this.roomId}] Client`, client.id, 'failed to reconnect after leaving:', err)
            })
        }
      }
    }
  }

  onDispose () {
    console.log(`[Room ${this.roomId}] Room empty, destroyed`)
  }
}
