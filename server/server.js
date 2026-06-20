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

// Local memory map tracking user mappings to socket connections
// Structure: { "socket_id_xyz": { roomId: "id", userName: "name" } }
const userSocketMap = {};

// Helper helper function to collect all active clients inside a specific room
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

    // 1. Listen for frontend joins
    socket.on("join-room", ({ roomId, currentUserName }) => {
        // Save client mapping context info
        userSocketMap[socket.id] = { roomId, userName: currentUserName };
        
        // Put socket into isolating virtual channel
        socket.join(roomId);

        // Fetch current active peers in this room
        const clients = getAllConnectedClients(roomId);

        // Notify existing members a new peer arrived
        socket.to(roomId).emit("user-joined", {
            userName: currentUserName,
            socketId: socket.id,
            clients
        });

        // Send back fresh peers list directly to the client that just joined
        socket.emit("room-joined-success", { clients });
    });

    // 2. Real-time Keystroke Synchronization
    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", code);
    });

    // 3. Clean up when client disconnects
    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        
        rooms.forEach((roomId) => {
            socket.to(roomId).emit("user-left", {
                socketId: socket.id,
                userName: userSocketMap[socket.id]?.userName,
            });
        });

        delete userSocketMap[socket.id];
    });
});

server.listen(Port, () => { 
    console.log(`The Server is Running at Port: ${Port}`)
})