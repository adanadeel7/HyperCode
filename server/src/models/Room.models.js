import mongoose from "mongoose";

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

const roomSchema = new mongoose.Schema({
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


export const Room = mongoose.model("Room",roomSchema)