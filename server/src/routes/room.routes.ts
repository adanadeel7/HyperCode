import { Router } from "express";
import { Room } from "../models/Room.models.js";
import { protect } from "../middleware/auth.middleware.js";
import {Request, Response} from 'express'
import { createRooms, deleteRoom, getRooms } from "../controllers/rooms.controllers.js";

const router = Router();


router.get("/rooms", protect, getRooms);

router.post("/rooms", protect,createRooms );

// DELETE /api/rooms/:roomId: Delete a workspace (requires ownership)
router.delete("/rooms/:roomId", protect,deleteRoom );

export default router;
