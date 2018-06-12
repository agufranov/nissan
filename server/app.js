const express = require('express')
const http = require('http')
const SocketIO = require('socket.io')
const SerialPort = require('serialport')

const devicePath = '/dev/tty.HC-06-SPPDev'
// const port = new SerialPort(devicePath)
// port.on('open', () => console.log('Opened'))
// port.on('close', () => console.log('Closed'))

const app = express()
const server = http.createServer(app)
const io = SocketIO(server)

io.on('connection', (socket) => {
    console.log('IO connection')
    socket.on('message', (msg) => console.log('message', msg))
    socket.send([255, 251])
})

app.use(express.static('public'))

server.listen(3000)