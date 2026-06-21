import { Router } from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/execute", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "No code provided for execution." });
    }

    const filename = `runner_${uuidv4()}.js`;
    const filepath = path.join(process.cwd(), "tmp", filename);

    if (!fs.existsSync(path.join(process.cwd(), "tmp"))) {
        fs.mkdirSync(path.join(process.cwd(), "tmp"));
    }

    try {
        fs.writeFileSync(filepath, code);

        exec(`node ${filepath}`, { timeout: 5000 }, (error, stdout, stderr) => {
            // Clean up the temporary file immediately after execution completes
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }

            if (error && error.killed) {
                return res.json({
                    success: false,
                    output: "[Execution Error]: Process exceeded maximum 5-second safety timeout limit."
                });
            }

            if (stderr) {
                return res.json({
                    success: false,
                    output: stderr
                });
            }

            return res.json({
                success: true,
                output: stdout || "[Success]: Process executed cleanly with no output streams."
            });
        });

    } catch (err) {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return res.status(500).json({ error: err.message });
    }
});

export default router;