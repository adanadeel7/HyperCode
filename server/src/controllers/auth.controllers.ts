import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserDocument, User } from "../models/Users.models.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { error, log } from "node:console";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendTwoFactorOTPEmail,
} from "../utils/sendEmail.js";

dotenv.config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as
    | "none"
    | "strict"
    | "lax",

  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment");
  }
  return secret;
}

const jwt_secret = getJWTSecret();

if (!jwt_secret) {
  throw new Error("JWT_SECRET is not defined in environment");
}

async function registerUser(req: Request, res: Response) {
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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: emailVerificationExpires,
    });

    const isProduction =
      process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      (isProduction ? "https://hyper-code.vercel.app" : "http://localhost:5173")
    ).replace(/\/$/, "");

    try {
      await sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
        frontendUrl,
      );
    } catch (emailError) {
      // Rollback user document if sending verification email fails
      await User.deleteOne({ _id: user._id });
      console.error("Email sending failure during registration:", emailError);
      const emailErrMsg =
        emailError instanceof Error ? emailError.message : String(emailError);
      return res.status(500).json({
        message:
          "Failed to send verification email. Please check your Brevo SMTP settings.",
        error: emailErrMsg,
      });
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      message:
        "Registration successful! A verification link has been sent to your email. Please verify your email before logging in.",
      email: user.email,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return res
      .status(500)
      .json({ message: "Registration failed", error: message });
  }
}

async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res
        .status(400)
        .json({ message: " Invalid or missing verification token" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Verification link is invalid or has expired." });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return res.status(500).json({ message });
  }
}

async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: " Email is Required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "This email is already verified. Please log in." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const isProduction =
      process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      (isProduction ? "https://hyper-code.vercel.app" : "http://localhost:5173")
    ).replace(/\/$/, "");
    await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
      frontendUrl,
    );

    return res.status(200).json({
      success: true,
      message: "A fresh verification link has been sent to your email.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resend verification";
    return res.status(500).json({ message });
  }
}

async function sendMyVerificationEmail(req: Request, res: Response) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ messgae: "Not authorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Your email is already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw Error("Frontend URL not defined in envoirmental variables");
    }
    await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
      frontendUrl,
    );
    return res.status(200).json({
      success: true,
      message: "Verification email sent to your inbox!",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send verification";
    return res.status(500).json({ message });
  }
}

async function loginUser(req: Request, res: Response) {
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
    const Userpassword = user.password;

    if (!Userpassword) {
      throw Error("Password not found");
    }

    const isPasswordValid = await bcrypt.compare(password, Userpassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in.",
        isEmailVerified: false,
        email: user.email,
      });
    }

    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorOtp = otp;
      user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendTwoFactorOTPEmail(user.email, user.name, otp);
      } catch (emailError) {
        console.error("2FA OTP email failed to send:", emailError);
        const emailErrMsg =
          emailError instanceof Error ? emailError.message : String(emailError);
        return res.status(500).json({
          message: "Failed to send security code email. Please try again.",
          error: emailErrMsg,
        });
      }

      return res.status(200).json({
        twoFactorRequired: true,
        email: user.email,
        message: "A 6-digit security code has been sent to your email.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      jwt_secret,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "User Login Successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        editorSettings: user.editorSettings,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message: "Login Failed", error: message });
  }
}

async function logoutUser(req: Request, res: Response) {
  res.clearCookie("token");
  res.status(200).json({
    message: " User Successfully Logged out",
  });
}

async function verifyTwoFactorOTP(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP code are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !user.twoFactorOtp ||
      user.twoFactorOtp !== String(otp).trim() ||
      !user.twoFactorOtpExpires ||
      user.twoFactorOtpExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired security code" });
    }

    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, jwt_secret, { expiresIn: "7d" });

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "2FA Verification successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        editorSettings: user.editorSettings,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "2FA verification failed";
    return res.status(500).json({ message });
  }
}

async function toggleTwoFactor(req: Request, res: Response) {
  try {
    const userId = req.user?._id;

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password confirmation required",
      });
    }
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
  

    const UserPassword = user.password

    if (!UserPassword ) {
      throw Error("User Password no correct");
    }

    
    const isMatch = await bcrypt.compare(password, UserPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();

    return res.status(200).json({
      success: true,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      message: user.isTwoFactorEnabled
        ? "Two-factor authentication enabled successfully"
        : "Two-factor authentication disabled",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle 2FA";
    return res.status(500).json({ message });
  }
}

async function getCurrentUser(req : Request, res : Response) {
  const user = req.user

  if (!user) {
    return res.status(401).json({message : "User not found"})
  }

  return res.status(200).json({
    success : true,
    user : {
      _id : user._id,
      name : user.name,
      email : user.email,
    isEmailVerified : user.isEmailVerified,
    isTwoFactorEnabled : user.isTwoFactorEnabled,
    editorSettings : user.editorSettings
    }
  })
}


function googleAuthCallback(req: Request, res: Response) {
  let frontendUrl = process.env.FRONTEND_URL;

  if (req.query.state) {
    try {
      const parsed = JSON.parse(
        Buffer.from(String(req.query.state), "base64").toString("utf8"),
      );
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
      return res.redirect(
        `${frontendUrl}/login?error=server_configuration_error`,
      );
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
        | "none"
        | "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${frontendUrl}/?login=google`);
  } catch (error) {
    console.error("googleAuthCallback exception:", error);
    return res.redirect(`${frontendUrl}/login?error=oauth_callback_exception`);
  }
}

async function updateEditorSettings(req: Request, res: Response) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { theme, fontSize, wordWrap, minimap } = req.body;

    if (theme !== undefined) user.editorSettings.theme = theme;
    if (fontSize !== undefined) user.editorSettings.fontSize = fontSize;
    if (wordWrap !== undefined) user.editorSettings.wordWrap = wordWrap;
    if (minimap !== undefined) user.editorSettings.minimap = minimap;

    await user.save();

    return res.status(200).json({
      success: true,
      editorSettings: user.editorSettings,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update editor settings";
    return res.status(500).json({ message });
  }
}

export {
  registerUser,
  loginUser,
  logoutUser,
  googleAuthCallback,
  verifyEmail,
  resendVerificationEmail,
  verifyTwoFactorOTP,
  toggleTwoFactor,
  sendMyVerificationEmail,
  getCurrentUser,
  updateEditorSettings
};
