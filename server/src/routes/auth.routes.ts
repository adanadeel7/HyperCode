import express from "express"
import { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  resendVerificationEmail, 
  sendMyVerificationEmail,
  logoutUser, 
  googleAuthCallback,
  verifyTwoFactorOTP,
  toggleTwoFactor,
  getCurrentUser,
  updateEditorSettings
} from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.middleware.js";
import passport from "passport";
const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); 
router.get('/google', (req, res, next) => {
    const origin = req.query.origin ? String(req.query.origin) : undefined;
    const state = origin ? Buffer.from(JSON.stringify({ origin })).toString('base64') : undefined;
    passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});

const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);
const defaultFrontendUrl = (process.env.FRONTEND_URL || (isProduction ? "https://hyper-code.vercel.app" : "http://localhost:5173")).replace(/\/$/, "");

router.get('/google/callback', (req, res, next) => {
    let failureRedirect = `${defaultFrontendUrl}/login`;
    if (req.query.state) {
        try {
            const parsed = JSON.parse(Buffer.from(String(req.query.state), 'base64').toString('utf8'));
            if (parsed.origin) {
                failureRedirect = `${parsed.origin.replace(/\/$/, '')}/login`;
            }
        } catch (e) {
            
        }
    }
    passport.authenticate('google', { session: false, failureRedirect })(req, res, next);
}, googleAuthCallback);

router.get("/verify-email", verifyEmail);
router.post("/send-verification", protect, sendMyVerificationEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/2fa/verify", verifyTwoFactorOTP);
router.post("/2fa/toggle", protect, toggleTwoFactor);
router.get("/me", protect, getCurrentUser)
router.patch("/settings",protect,updateEditorSettings)

export default router;