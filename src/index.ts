import express from "express"
// import cors from "cors"
import http from "http"
import { Server } from "socket.io"

const app = express()

// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }))

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log(`a user connected: ${socket.id}`)
  // socket.on('disconnect', () => {
  //   console.log('user disconnected')
  // })
  // socket.on('message', (msg) => {
  //   console.log(`message: ${msg}`)
  // })
})

app.listen(5000, () => {
  console.log("Server started on port 5000")
})