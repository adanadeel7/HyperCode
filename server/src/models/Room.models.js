import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomId: { 
        type: String,
        required: true, 
        unique: true,
        trim: true
    }, 

    currentCode: { 
        type: String, 
        default: `// Welcome to your persistent HyperCode workspace\nfunction init() {\n  console.log("Ready.");\n}\ninit();`
    }, 
    
    language: { 
        type : String, 
        default : "javascript"
    }, 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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