import express from "express" 
import compilerRouter from "./routes/compiler.routes.js"
import cors from "cors"; 

const app = express()

app.use(cors({
    origin: "*", 
    methods: ["GET", "POST"]
}));

app.use(express.json());
app.use("/api", compilerRouter);
export default app;