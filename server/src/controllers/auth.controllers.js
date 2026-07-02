import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import { User } from "../models/Users.models.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()


const jwt_secret = process.env.JWT_SECRET

async function registerUser(req,res) {
    const {name,email,password} = req.body

    const isUserAlreadyExist = await User.findOne({
        email
    })

    if(isUserAlreadyExist) { 
        return res.status(400).json({
            message : "User Already Exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password,10)
    const user = await User.create({ 
        name, 
        email, 
        password : hashedPassword
    })

    const token = jwt.sign({
        id : user._id
    }, jwt_secret)

    res.cookie("token",token)

    res.status(201).json({
        message : "User register Successfully", 
        user : {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
    
}

async function loginUser(req,res) {
    const {email, password} = req.body

    const user = await User.findOne({
        email
    })


    if (!user) { 
        res.status(400).json({
            message : "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) { 
        res.status(400).json({
            message : "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id:user._id
    },jwt_secret)
    
    res.cookie("token",token)
    
    res.status(200).json({
        message: "User Login Successfully",
        user : { 
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
}

async function logoutUser(req,res) { 
    res.clearCookie("token")
    res.status(200).json({
        message: " User Successfully Logged out"
    })
} 


export {registerUser, loginUser,logoutUser}
