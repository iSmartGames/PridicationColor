const express = require('express')
const http = require('http')
const socketio = require('socket.io')
var cors = require('cors')

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } })
app.use(cors())

io.on('connection', (socket) => {

    console.log('a user connected')

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })

})

module.exports = { express, io, app, cors, server };