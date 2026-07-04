import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/Users.models.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      let user = null;

      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id).select("-password");
      }

      if (!user) {
        res.status(401);
        return res.json({ message: "Not authorized, user not found" });
      }

      req.user = user;
      next();
    } catch (error) {
         console.error('Auth middleware error:', error);
      res.status(401);
      return res.json({ message: 'Not authorized, token failed' });
    }
  }

   if (!token) {
    res.status(401);
    return res.json({ message: 'Not authorized, no token provided' });
  }
};

export { protect };
