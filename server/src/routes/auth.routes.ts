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
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.middleware.js";
import passport from "passport";

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);
const ALLOWED_ORIGINS = [
  "https://hypercodes.adancodes.dev",
  "https://hyper-code.vercel.app",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean).map(url => (url as string).replace(/\/$/, ""));

function getValidatedOrigin(rawOrigin?: string): string | undefined {
  if (!rawOrigin) return undefined;
  const normalized = String(rawOrigin).replace(/\/$/, "");
  return ALLOWED_ORIGINS.includes(normalized) ? normalized : undefined;
}

const defaultFrontendUrl = (
  process.env.FRONTEND_URL ||
  (isProduction ? "https://hypercodes.adancodes.dev" : "http://localhost:5173")
).replace(/\/$/, "");

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser); 
router.get('/google', (req, res, next) => {
    const safeOrigin = getValidatedOrigin(req.query.origin ? String(req.query.origin) : undefined);
    const state = safeOrigin ? Buffer.from(JSON.stringify({ origin: safeOrigin })).toString('base64') : undefined;
    passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    let failureRedirect = `${defaultFrontendUrl}/login`;
    if (req.query.state) {
        try {
            const parsed = JSON.parse(Buffer.from(String(req.query.state), 'base64').toString('utf8'));
            const safeOrigin = getValidatedOrigin(parsed.origin);
            if (safeOrigin) {
                failureRedirect = `${safeOrigin}/login`;
            }
        } catch (e) {
            
        }
    }
    passport.authenticate('google', { session: false, failureRedirect })(req, res, next);
}, googleAuthCallback);

router.get("/verify-email", verifyEmail);
router.post("/send-verification", protect, sendMyVerificationEmail);
router.post("/resend-verification", authLimiter, resendVerificationEmail);
router.post("/2fa/verify", otpLimiter, verifyTwoFactorOTP);
router.post("/2fa/toggle", protect, toggleTwoFactor);
router.get("/me", protect, getCurrentUser);
router.patch("/settings", protect, updateEditorSettings);

export default router;