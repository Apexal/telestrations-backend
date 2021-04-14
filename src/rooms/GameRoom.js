const colyseus = require('colyseus')
const config = require('../config')
const { validatePlayerDisplayName, generateRoomId, chooseRandomSecretWords } = require('../utils')
const { GameRoomState } = require('./schema/GameRoomState')
const { PlayerState } = require('./schema/PlayerState')

exports.GameRoom = class extends colyseus.Room {
  onCreate (options) {
    this.setState(new GameRoomState())

    this.roomId = generateRoomId()
    this.maxClients = config.maxClients

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
      this.state.players.delete(client.sessionId)
    }
    console.log(`[Room ${this.roomId}] Client`, client.id, 'left')
  }

  onDispose () {
    console.log(`[Room ${this.roomId}] Room empty, destroyed`)
  }
}
