import mongoose, { HydratedDocument } from "mongoose";

export interface IFile {
    name : string;
    content: string;
    language: string;
}

export interface IRoom {
    roomId : string;
    files : IFile[];
    activeFile : string;
    owner : mongoose.Types.ObjectId;
    members : mongoose.Types.ObjectId[];
    name : string
}

export type FileDocument = HydratedDocument<IFile>;
export type RoomDocument = HydratedDocument<IRoom>;





const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        default: ""
    },
    language: {
        type: String,
        default: "javascript"
    }
});

const roomSchema = new mongoose.Schema<IRoom>({
    roomId: { 
        type: String,
        required: true, 
        unique: true,
        trim: true
    }, 

    files: {
        type: [fileSchema],
        default: []
    },

    activeFile: {
        type: String,
        default: "main.js"
    },
    
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, 
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    
    name: {
        type: String,
        default: "Untitled Project"
    }

}, { 
    timestamps: true
})

export const file = mongoose.model<IFile>("File",fileSchema)
export const Room = mongoose.model<IRoom>("Room",roomSchema)