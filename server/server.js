import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import app from "./src/app.js"

dotenv.config()
const Port = process.env.PORT || 8000 

const server = http.createServer(app)
const io = new Server(server, { 
    cors: { 
        origin: "*", 
        methods: ["GET","POST"]
    }
})

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            userName: userSocketMap[socketId]?.userName,
        };
    });
}

io.on('connection', (socket) => {
    console.log(`Socket Connected:`, socket.id);

    socket.on("join-room", ({ roomId, currentUserName }) => {
        userSocketMap[socket.id] = { roomId, userName: currentUserName };
        
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);

        io.to(roomId).emit("user-joined", {
            userName: currentUserName,
            socketId: socket.id,
            clients
        });

        socket.emit("room-joined-success", { clients });
    });

    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", code);
    });

    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        
        rooms.forEach((roomId) => {
            const clientsAfterDisconnect = getAllConnectedClients(roomId).filter(
                (c) => c.socketId !== socket.id
            );

            socket.to(roomId).emit("user-left", {
                socketId: socket.id,
                userName: userSocketMap[socket.id]?.userName,
                clients: clientsAfterDisconnect
            });
        });

        delete userSocketMap[socket.id];
    });
});

server.listen(Port, () => { 
    console.log(`The Server is Running at Port: ${Port}`)
})