import mongoose, { Schema, Document } from "mongoose";



export interface UserDocument extends Document{
    name : string; 
    email: string;
    password?: string;
    googleId ?: string; 
}

const userSchema = new mongoose.Schema<UserDocument>( { 
    name : { 
        type : String, 
        required : true, 
    },

    email : { 
        type : String, 
        required : true, 
        unique : true, 
    },

    password : { 
        type : String, 
        required: function(this: any) {
        return !this.googleId; 
        }
    },

    googleId : { 
        type: String, 
        unique : true,
        sparse : true
    }



}, { 
    timestamps: true
})

export const User = mongoose.model<UserDocument>("User",userSchema)