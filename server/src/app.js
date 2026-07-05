import express from "express" 
import compilerRouter from "./routes/compiler.routes.js"
import cors from "cors"; 
import authRouter from "./routes/auth.routes.js";
import roomRouter from "./routes/room.routes.js";
import cookieParser from "cookie-parser";

const app = express()

// 1. Configure Global Middlewares First
app.use(cors({
    origin: "http://localhost:5173", 
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
