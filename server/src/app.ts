import express from "express" 
import compilerRouter from "./routes/compiler.routes.js"
import cors from "cors"; 
import authRouter from "./routes/auth.routes.js";
import roomRouter from "./routes/room.routes.js";
import cookieParser from "cookie-parser";

const app = express()

// 1. Configure Global Middlewares First
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:5173",
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (!origin) {
            return callback(null, true);
        }

        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, 
}));
app.use(express.json());
app.use(cookieParser());

// 2. Base Health Check
app.get('/', (req,res) => { 
    res.send("API Working")
})

// 3. Mount Routes
app.use("/api/auth", authRouter);
app.use("/api", roomRouter);
app.use("/api", compilerRouter);

export default app;
