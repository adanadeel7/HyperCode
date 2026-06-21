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
    }

}, { 
    timestamps: true
})


export const Room = mongoose.model("Room",roomSchema)