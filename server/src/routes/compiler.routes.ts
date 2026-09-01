import { Router } from "express";
import codeExecution from "../controllers/compiler.controllers.js";
import { protect } from "../middleware/auth.middleware.js";
import { executeLimiter } from "../middleware/rateLimiter.middleware.js";
const router = Router();

router.post("/execute",protect,executeLimiter,codeExecution);

export default router;