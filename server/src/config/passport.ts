import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import passport from "passport";
import { User } from "../models/Users.models"; 

const clientid = process.env.GOOGLE_CLIENT_ID!;
const clientsecret = process.env.GOOGLE_CLIENT_SECRET!;
const callback = process.env.NODE_ENV === "production" 
    ? "https://your-render-url.onrender.com/api/auth/google/callback" 
    : "http://localhost:8000/api/auth/google/callback";

passport.use(
    new GoogleStrategy({
        clientID: clientid, 
        clientSecret: clientsecret, 
        callbackURL: callback
    }, 
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : "";

            let user = await User.findOne({ email: email });
            
            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
            } else { 
                user = await User.create({
                    name: profile.displayName, 
                    email: email, 
                    googleId: profile.id
                });
            }

            return done(null, user);
        } catch(err) { 
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