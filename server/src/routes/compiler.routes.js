import { Router } from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/execute", async (req, res) => {
    const { code, filename } = req.body;

    if (!code) {
        return res.status(400).json({ error: "No code provided for execution." });
    }

    const activeFilename = filename || "main.js";
    const ext = activeFilename.split('.').pop().toLowerCase();
    const runnerFilename = `runner_${uuidv4()}.${ext}`;
    const filepath = path.join(process.cwd(), "tmp", runnerFilename);

    if (!fs.existsSync(path.join(process.cwd(), "tmp"))) {
        fs.mkdirSync(path.join(process.cwd(), "tmp"));
    }

    // Direct return for HTML/CSS files
    if (ext === "html" || ext === "css") {
        return res.json({
            success: true,
            output: "[System]: Live preview rendered successfully."
        });
    }

    try {
        fs.writeFileSync(filepath, code);

        let command = "";
        let binaryPath = "";

        switch (ext) {
            case "js":
                command = `node "${filepath}"`;
                break;
            case "py":
                command = `python "${filepath}"`;
                break;
            case "cpp":
                binaryPath = filepath.replace(".cpp", ".exe");
                command = `g++ "${filepath}" -o "${binaryPath}" && "${binaryPath}"`;
                break;
            default:
                command = `node "${filepath}"`;
                break;
        }

        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            // Clean up files immediately after execution completes
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
            if (binaryPath && fs.existsSync(binaryPath)) {
                fs.unlinkSync(binaryPath);
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