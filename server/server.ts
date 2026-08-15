import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app";
import connectDB from "./src/config/db"; 
import { Room } from "./src/models/Room.models.js";
import router from "./src/routes/auth.routes.js";

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


function getAllConnectedClients(roomId : any) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            userName: userSocketMap[socketId]?.userName,
        };
    });
}

io.on('connection', (socket : any) => {
    console.log(`Socket Connected:`, socket.id);

    socket.on("join-room", async ({ roomId, currentUserName }) => {
        userSocketMap[socket.id] = { roomId, userName: currentUserName };
        socket.join(roomId);

        let roomData = null;
        const defaultCode = `// Welcome to your persistent HyperCode workspace\nfunction init() {\n  console.log("Ready.");\n}\ninit();`;
        
        try {
            roomData = await Room.findOne({ roomId });
            if (!roomData) {
                roomData = await Room.create({ 
                    roomId,
                    files: [{ name: "main.js", content: defaultCode, language: "javascript" }],
                    activeFile: "main.js"
                });
                console.log(`New room persistent document created in database: #${roomId}`);
            } else if (!roomData.files || roomData.files.length === 0) {
                // Migration path for legacy single-file databases
                const legacyCode = roomData.get('currentCode') || defaultCode;
                roomData.files = [{ name: "main.js", content: legacyCode, language: "javascript" }];
                roomData.activeFile = "main.js";
                await roomData.save();
                console.log(`Migrated legacy room persistent document: #${roomId}`);
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
            files: roomData ? roomData.files : [],
            activeFile: roomData ? roomData.activeFile : "main.js"
        });
    });

    socket.on("code-change", ({ roomId, filename, code }) => {
        socket.to(roomId).emit("code-update", { filename, code });

        const saveKey = `${roomId}_${filename}`;

        if (saveTimeouts[saveKey]) {
            clearTimeout(saveTimeouts[saveKey]);
        }

        saveTimeouts[saveKey] = setTimeout(async () => {
            try {
                await Room.findOneAndUpdate(
                    { roomId, "files.name": filename },
                    { $set: { "files.$.content": code } }
                );
                console.log(`[Autosave Success]: Code saved to MongoDB for file '${filename}' in room #${roomId}`);
                delete saveTimeouts[saveKey];
            } catch (err) {
                console.error("Database background autosave exception:", err);
            }
        }, 2000); 
    });

    socket.on("create-file", async ({ roomId, filename, language }) => {
        try {
            const newFile = { name: filename, content: "", language };
            const room = await Room.findOneAndUpdate(
                { roomId, "files.name": { $ne: filename } }, // Avoid duplicates
                { $push: { files: newFile } },
                { new: true }
            );
            if (room) {
                io.to(roomId).emit("file-created", newFile);
                console.log(`[File Created]: File '${filename}' added to room #${roomId}`);
            }
        } catch (err) {
            console.error("Database create file exception:", err);
        }
    });

    socket.on("delete-file", async ({ roomId, filename }) => {
        try {
            const room = await Room.findOneAndUpdate(
                { roomId },
                { $pull: { files: { name: filename } } },
                { new: true }
            );
            if (room) {
                let nextActive = room.activeFile;
                if (room.activeFile === filename) {
                    nextActive = room.files.length > 0 ? room.files[0].name : "";
                    room.activeFile = nextActive;
                    await room.save();
                }
                io.to(roomId).emit("file-deleted", { filename, nextActive });
                console.log(`[File Deleted]: File '${filename}' removed from room #${roomId}`);
            }
        } catch (err) {
            console.error("Database delete file exception:", err);
        }
    });

    socket.on("select-file", async ({ roomId, filename }) => {
        try {
            await Room.findOneAndUpdate({ roomId }, { activeFile: filename });
            socket.to(roomId).emit("file-selected", filename);
        } catch (err) {
            console.error("Database select file exception:", err);
        }
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
