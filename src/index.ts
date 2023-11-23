import express from "express"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"

const app = express()

app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

type userData = {
  id: string,
  count: number,
  requests: string[],
  admins: string[],
  access: string[]
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
  const index = users.findIndex((user) => user.id === socket.id)
  users.splice(users.length, 0, { id: socket.id, count: 0, requests: [], admins: [], access: [socket.id] })
  console.log(users)
  update('users_updated')

  socket.on('disconnect', () => {
    console.log(`user disconnected: ${socket.id}`)
    const index = users.findIndex((user) => user.id === socket.id)
    // remove the user from all the requests and admins arrays
    users.forEach((user) => {
      user.requests = user.requests.filter((request) => request !== index.toString())
      user.admins = user.admins.filter((admin) => admin !== index.toString())
      user.access = user.access.filter((access) => access !== index.toString())
    })
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

  socket.on('request_access', ({socketId, key}) => {
    const index = users.findIndex((user) => user.id === socketId)
    if (!users[key].requests.includes(index.toString()) && !users[key].admins.includes(index.toString())) {
      users[key].requests.push(index.toString())
    }
    update('users_updated')
  })

  socket.on('accept_request', ({socketId, key}) => {
    console.log(socketId)
    console.log(key)
    const index = users.findIndex((user) => user.id === socketId)
    users[index].admins.push(key)
    users[index].requests = users[index].requests.filter((request) => request !== key)
    users[index].access.push(users[key].id)
    update('users_updated')
  })

  socket.on('reject_request', ({socketId, key}) => {
    const index = users.findIndex((user) => user.id === socketId)
    users[index].requests = users[index].requests.filter((request) => request !== key)
    update('users_updated')
  })

  socket.on('remove_admin', ({socketId, key}) => {
    const index = users.findIndex((user) => user.id === socketId)
    users[index].admins = users[index].admins.filter((admin) => admin !== key)
    users[index].access = users[index].access.filter((access) => access !== users[key].id)
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