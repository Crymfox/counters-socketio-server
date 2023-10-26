import express from "express"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"

const app = express()

app.use(cors)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

type userData = {
  id: string
  count: number
}

const users: userData[] = []

io.on('connection', (socket) => {

  const update = (s: string) => {
    socket.emit(s, users)
    socket.broadcast.emit(s, users)
  }

  console.log(`a user connected: ${socket.id}`)
  // users.push({ id: socket.id, count: 0 })
  // add user to users array in the last position without using push
  users.splice(users.length, 0, { id: socket.id, count: 0 })
  console.log(users.length)
  update('users_updated')

  socket.on('disconnect', () => {
    console.log(`user disconnected: ${socket.id}`)
    const index = users.findIndex((user) => user.id === socket.id)
    users.splice(index, 1)
    // users.pop()
    console.log(users.length)
    update('users_updated')
  })

  socket.on('count_change', ({count, index}) => {
    // const index = users.findIndex((user) => user.id === socket.id)
    users[index].count = count
    // console.log(users)
    // socket.emit('count_changed', {count, index})
    update('users_updated')
  })
  // socket.on('disconnect', () => {
  //   console.log('user disconnected')
  // })
  // socket.on('message', (msg) => {
  //   console.log(`message: ${msg}`)
  // })
})

server.listen(5000, () => {
  console.log("Server started on port 5000")
})