import { Request, Response } from "express";
import { Room } from "../models/Room.models.js";

async function getRooms(req : Request ,res : Response) {
    const userid = req.user?._id;
    if (!userid) {
        return res.status(401).json({ success: false, message: "User authentication required" });
    }

    try {
        const rooms = await Room.find({
            $or: [
                { owner: userid },
                { members: userid }
            ]
        }).sort({ updatedAt: -1 });

        res.json({ success: true, rooms });
    } catch (error) {
        if (!error) {
            throw Error('Problem in get')
        }
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
    
}


async function createRooms(req : Request, res:Response) { 
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const { roomId, name } = req.body;

        const newRoom = await Room.create({
            roomId,
            name: name || "Untitled Workspace",
            owner: req.user._id
        });

        res.status(201).json({ success: true, room: newRoom });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
}


async function deleteRoom(req : Request, res:Response) { 
    try {
        const { roomId } = req.params;
        if (!roomId) {
            return res.status(400).json({ success: false, message: "roomId is required" });
        }
        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({ success: false, message: "Workspace not found" });
        }

        // Authorization check: only owner can delete the workspace
        if (room.owner && room.owner.toString() !== req.user?._id?.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this workspace" });
        }

        await Room.deleteOne({ roomId });
        res.json({ success: true, message: "Workspace deleted successfully" });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
}


export {createRooms,getRooms,deleteRoom}