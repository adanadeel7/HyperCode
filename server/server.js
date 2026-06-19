import dotenv from "dotenv"
import app from "./src/app.js"
import http from "http"
import { Server } from "socket.io"
dotenv.config()
const Port = process.env.PORT || 8000 

const server = http.createServer(app)
const io = new Server(server, { 
    cors: { 
        origin: "*", 
        methods: ["GET","POST"]
    }
})


io.on('connection', (socket) => {
    console.log(`Socket Connect`, socket.id)
})


server.listen(Port, ()=> { 
    console.log(`The Server is Running at Port: ${Port}` )
})






