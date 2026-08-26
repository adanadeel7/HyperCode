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

function googleAuthCallback(req: Request, res: Response) { 
  
  let frontendUrl = process.env.FRONTEND_URL

  if (req.query.state) {
    try {
      const parsed = JSON.parse(Buffer.from(String(req.query.state), "base64").toString("utf8"));
      if (parsed.origin) {
        frontendUrl = String(parsed.origin).replace(/\/$/, "");
      }
    } catch (e) {
      console.warn("Failed to parse OAuth state parameter:", e);
    }
  }

  try {
    if (!req.user) { 
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
    const user = req.user as UserDocument;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is missing!");
      return res.redirect(`${frontendUrl}/login?error=server_configuration_error`);
    }

    const token = jwt.sign(
      { id: user._id }, 
      jwtSecret, 
      { expiresIn: "7d" }
    );

    const userObj = encodeURIComponent(JSON.stringify({
      _id : user._id, 
      name : user.name, 
      email : user.email 
    }))

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
  
    return res.redirect(`${frontendUrl}/?token=${token}&user=${userObj}`);
  } catch (error) {
    console.error("googleAuthCallback exception:", error);
    return res.redirect(`${frontendUrl}/login?error=oauth_callback_exception`);
  }
}


export { registerUser, loginUser, logoutUser,googleAuthCallback };
