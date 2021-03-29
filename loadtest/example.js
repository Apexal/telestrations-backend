exports.requestJoinOptions = function (i) {
  return { requestNumber: i }
}

exports.onJoin = function () {
  console.log(this.sessionId, 'joined.')

  this.onMessage('*', (type, message) => {
    console.log(this.sessionId, 'received:', type, message)
  })

  setTimeout(() => {
    this.send('player_set_displayName', {
      displayName: 'Bob'
    })
  }, 2000)
}

exports.onLeave = function () {
  console.log(this.sessionId, 'left.')
}

exports.onError = function (err) {
  console.log(this.sessionId, '!! ERROR !!', err.message)
}

exports.onStateChange = function (state) {
  console.log(this.sessionId, 'new state:', state)
}
