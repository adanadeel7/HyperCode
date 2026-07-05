import { Router } from "express";
import { Room } from "../models/Room.models.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/rooms: Fetch all rooms owned by or shared with the user
router.get("/rooms", protect, async (req, res) => {
    try {
        const rooms = await Room.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        }).sort({ updatedAt: -1 }); // Order by most recently updated
        
        res.json({ success: true, rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/rooms: Create a new room associated with the logged-in user
router.post("/rooms", protect, async (req, res) => {
    try {
        const { roomId, name } = req.body;
        
        const newRoom = await Room.create({
            roomId,
            name: name || "Untitled Workspace",
            owner: req.user._id
        });
        
        res.status(201).json({ success: true, room: newRoom });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
