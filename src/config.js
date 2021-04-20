module.exports = {
  /** Rules for display names. */
  displayNames: {
    minLength: 3,
    maxLength: 20
  },
  /** The length of the randomly generated room ids. */
  roomIdLength: 5,
  /** The minimum number of players needed before a game can start. */
  minClients: 1, // TODO: change in prod
  /** The maximum number of players a game can hold. */
  maxClients: 12,
  /** The number of seconds players get to guess what
   * the previous drawing they are shown is and to
   * submit a drawing themselves. */
  roundTimerSeconds: 120
}
