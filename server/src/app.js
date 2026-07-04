import express from "express" 
import compilerRouter from "./routes/compiler.routes.js"
import cors from "cors"; 
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express()

app.get('/', (req,res) => { 
    res.send("API Working")
})

app.use('/api/auth', router)

app.use(cookieParser())


app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true, 
}));


app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", compilerRouter);
export default app;
