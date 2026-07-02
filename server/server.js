import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js"; 
import { Room } from "./src/models/Room.models.js";

dotenv.config();
const Port = process.env.PORT || 8000;

connectDB();

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {};


const saveTimeouts = {};

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

    socket.on("join-room", async ({ roomId, currentUserName }) => {
        userSocketMap[socket.id] = { roomId, userName: currentUserName };
        socket.join(roomId);

        let roomData = null;
        try {
            roomData = await Room.findOne({ roomId });
            if (!roomData) {
                roomData = await Room.create({ roomId });
                console.log(`New room persistent document created in database: #${roomId}`);
            }
        } catch (err) {
            console.error("Database room allocation error:", err);
        }

        const clients = getAllConnectedClients(roomId);

        io.to(roomId).emit("user-joined", {
            userName: currentUserName,
            socketId: socket.id,
            clients
        });

        socket.emit("room-joined-success", { 
            clients,
            code: roomData ? roomData.currentCode : "" 
        });
    });

    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", code);

        if (saveTimeouts[roomId]) {
            clearTimeout(saveTimeouts[roomId]);
        }

        saveTimeouts[roomId] = setTimeout(async () => {
            try {
                await Room.findOneAndUpdate({ roomId }, { currentCode: code });
                console.log(`[Autosave Success]: Code saved to MongoDB for room #${roomId}`);
                delete saveTimeouts[roomId];
            } catch (err) {
                console.error("Database background autosave exception:", err);
            }
        }, 2000); 
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
    console.log(`The Server is Running at Port: ${Port}`);
});
