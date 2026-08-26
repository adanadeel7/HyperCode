import { Router } from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import codeExecution from "../controllers/compiler.controllers";

const router = Router();

router.post("/execute",codeExecution);

export default router;