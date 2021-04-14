const http = require('http')
const express = require('express')
const cors = require('cors')
const colyseus = require('colyseus')
const { LobbyRoom } = colyseus
const monitor = require('@colyseus/monitor').monitor

const { GameRoom } = require('./rooms/GameRoom')

const port = process.env.PORT || 2567
const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const gameServer = new colyseus.Server({
  server: server
})

// register your room handlers
gameServer.define('lobby', LobbyRoom)
gameServer
  .define('game_room', GameRoom)
  .enableRealtimeListing()

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())

gameServer.listen(port, '0.0.0.0')
console.log(`Listening on ws://localhost:${port}`)
