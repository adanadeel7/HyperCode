import mongoose, { Schema, Document,Types } from "mongoose";



export interface UserDocument extends Document{
    _id: Types.ObjectId; 
    name : string; 
    email: string;
    password?: string;
    googleId ?: string; 

    //Email Verification 
    isEmailVerified : boolean; 
    emailVerificationToken ?: string | undefined;
    emailVerificationExpires?: Date  | undefined ; 

    //2FA (Email OTP)
      isTwoFactorEnabled: boolean;
    twoFactorOtp?: string | undefined;
        twoFactorOtpExpires?: Date | undefined;

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
    }, 
    
    isEmailVerified : { 
        type : Boolean,
        default : false
    }, 

    emailVerificationToken : { 
        type: String,
    },
    
    emailVerificationExpires : { 
        type: Date,
    },

    isTwoFactorEnabled : { 
        type : Boolean,
        default : false
    }, 

    twoFactorOtp : { 
        type: String,
    },
    
    twoFactorOtpExpires : { 
        type: Date,
    },



}, { 
    timestamps: true
})

export const User = mongoose.model<UserDocument>("User",userSchema)