import express from "express"
import { registerUser, loginUser, logoutUser,googleAuthCallback } from "../controllers/auth.controllers.js"
import passport from "passport";

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); 
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email']}))
router.get('/google/callback', passport.authenticate('google', { session : false, failureRedirect : 'http://localhost:5173/'}),googleAuthCallback)

export default router;