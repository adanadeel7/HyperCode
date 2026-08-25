import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserDocument,User } from "../models/Users.models.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { error } from "node:console";

dotenv.config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as "none" | "strict" | "lax",

  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function getJWTSecret(): string { 
  const secret = process.env.JWT_SECRET; 

  if (!secret) { 
    throw new Error("JWT_SECRET is not defined in environment")
  }
  return secret
}


const jwt_secret = getJWTSecret();

if (!jwt_secret) { 
  throw new Error("JWT_SECRET is not defined in environment")
}

async function registerUser(req : Request, res : Response) {
  try {
    const { name, email, password } = req.body;

    const isUserAlreadyExist = await User.findOne({
      email,
    });

    if (isUserAlreadyExist) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      jwt_secret, 
      {expiresIn: "7d"}
    );

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "User register Successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return res
      .status(500)
      .json({ message: "Registration failed", error: message });
  }
}

async function loginUser(req : Request, res : Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    const Userpassword = user.password

    if (!Userpassword) { 
      throw Error( "Password not found")
    }

    const isPasswordValid = await bcrypt.compare(password, Userpassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      jwt_secret, 
      {expiresIn: "7d"}
    );

    res.cookie("token", token,cookieOptions);

    res.status(200).json({
      message: "User Login Successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res
      .status(500)
      .json({ message: "Login Failed", error: message });
  }
}

async function logoutUser(req: Request, res: Response) {
  res.clearCookie("token");
  res.status(200).json({
    message: " User Successfully Logged out",
  });
}

 function googleAuthCallback(req:Request, res:Response) { 
  if (!req.user) { 
    return res.redirect('http://localhost:8000/login');
  }
  const user = req.user as UserDocument

  const token = jwt.sign(
        { id: user._id}, 
        process.env.JWT_SECRET!, 
        { expiresIn: '1h' }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600000, // 1 hour in milliseconds
    });
  
    res.redirect(`http://localhost:5173/?token=${token}`);
}


export { registerUser, loginUser, logoutUser,googleAuthCallback };
