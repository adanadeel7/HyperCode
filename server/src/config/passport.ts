import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { User } from "../models/Users.models.js"; 

const clientid = process.env.GOOGLE_CLIENT_ID!;
const clientsecret = process.env.GOOGLE_CLIENT_SECRET!;

const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.RENDER);

const callback = process.env.GOOGLE_CALLBACK_URL || (
    isProduction 
        ? "https://hypercode-18ib.onrender.com/api/auth/google/callback" 
        : "http://localhost:8000/api/auth/google/callback"
);

passport.use(
    new GoogleStrategy({
        clientID: clientid, 
        clientSecret: clientsecret, 
        callbackURL: callback,
        proxy: true
    }, 
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : "";

            if (!email) {
                return done(new Error("No email found in Google profile"), undefined);
            }

            let user = await User.findOne({ email: email });
            
            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
            } else { 
                user = await User.create({
                    name: profile.displayName || (profile.name ? `${profile.name.givenName || ""} ${profile.name.familyName || ""}`.trim() : "") || email.split("@")[0] || "User", 
                    email: email, 
                    googleId: profile.id
                });
            }

            return done(null, user);
        } catch(err) { 
            console.error("Google Auth Strategy Exception:", err);
            return done(err as Error, undefined);
        }
    })
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => { 
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
    try { 
        const user = await User.findById(id);
        done(null, user);
    } catch (error) { 
        done(error, null);
    }
});