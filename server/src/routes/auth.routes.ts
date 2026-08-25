import express from "express"
import { registerUser, loginUser, logoutUser,googleAuthCallback } from "../controllers/auth.controllers.js"
import passport from "passport";

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); 
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email']}))
const frontendUrl = (process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "https://hyper-code-bnkar1hrn-adan21.vercel.app" : "http://localhost:5173")).replace(/\/$/, "");

router.get('/google/callback', passport.authenticate('google', { session : false, failureRedirect : `${frontendUrl}/login`}), googleAuthCallback);

export default router;