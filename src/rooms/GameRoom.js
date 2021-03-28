const colyseus = require('colyseus')
const { validatePlayerDisplayName } = require('../utils')
const { GameRoomState } = require('./schema/GameRoomState')
const { PlayerState } = require('./schema/PlayerState')

exports.GameRoom = class extends colyseus.Room {
  onCreate (options) {
    this.setState(new GameRoomState())

    /**
     * Event handler for the `player_set_displayName` event.
     * Updates the player's name and syncs it across all clients.
     */
    this.onMessage('player_set_displayName', (client, { displayName }) => {
      // Sanitize/validate display name
      const result = validatePlayerDisplayName(displayName)
      if (!result) return // Ignore requests to set displayName to something invalid

      const player = this.state.players.get(client.id)
      player.displayName = displayName
    })
  }

  /**
   * Called when a new client joins the room.
   *
   * @param {colyseus.Client} client
   * @param {*} options
   */
  onJoin (client, options) {
    this.state.players.set(client.id, new PlayerState())
  }

  onLeave (client, consented) {
  }

  onDispose () {
  }
}
