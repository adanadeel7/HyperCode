import jwt from "jsonwebtoken";
import { User } from "../models/Users.models.js";
import dotenv from 'dotenv'
import { Request, Response, NextFunction } from "express";
dotenv.config()

const protect = async (req :Request, res :Response, next : NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) { 
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    interface DecodedToken { 
      id : string
    }



    const decoded = jwt.verify(token, jwtSecret) as DecodedToken; 
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export { protect };
