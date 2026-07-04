import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/Users.models.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const jwt_secret = process.env.JWT_SECRET;

async function registerUser(req, res) {
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
    return res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
}

async function loginUser(req, res) {
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

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
    return res
      .status(500)
      .json({ message: "Login Failed", error: error.message });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({
    message: " User Successfully Logged out",
  });
}

export { registerUser, loginUser, logoutUser };
