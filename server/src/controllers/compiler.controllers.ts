import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";

const ALLOWED_EXTENSIONS = new Set(["js", "py", "cpp", "html", "css"]);

const DANGEROUS_PATTERNS: Record<string, RegExp[]> = {
    js: [
        /\bchild_process\b/i,
        /\bprocess\s*\.\s*(env|exit|kill|abort|chdir)\b/i,
        /\brequire\s*\(\s*['"](fs|net|http|https|dgram|dns|tls)['"]\s*\)/i,
        /\bimport\s+.*['"](fs|child_process|net|http|https)['"]/i,
    ],
    py: [
        /\b(import\s+os|from\s+os\s+import)\b/i,
        /\b(import\s+subprocess|from\s+subprocess\s+import)\b/i,
        /\b(import\s+sys|from\s+sys\s+import)\b/i,
        /\b(import\s+shutil|from\s+shutil\s+import)\b/i,
        /\b__import__\s*\(\s*['"](os|subprocess|sys|shutil)['"]\s*\)/i,
    ],
    cpp: [
        /\bsystem\s*\(/i,
        /\bfork\s*\(/i,
        /\bexec(l|lp|le|v|vp|vpe)?\s*\(/i,
    ]
};

async function codeExecution(req: Request, res: Response) {
    const { code, filename } = req.body;

    if (!code || typeof code !== "string") {
        return res.status(400).json({
            error: "No code provided for execution.",
        });
    }

    if (code.length > 50000) {
        return res.status(400).json({
            error: "Code payload exceeds maximum size limit (50KB).",
        });
    }

    const safeBasename = path.basename(filename || "main.js").replace(/[^a-zA-Z0-9._-]/g, "");
    const ext = safeBasename.split(".").pop()?.toLowerCase() || "js";

    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return res.status(400).json({
            error: `Unsupported language extension '.${ext}'. Allowed extensions: js, py, cpp, html, css.`,
        });
    }

    if (ext === "html" || ext === "css") {
        return res.json({
            success: true,
            output: "[System]: Live preview rendered successfully.",
        });
    }

    // Inspect code for dangerous system invocations
    const patterns = DANGEROUS_PATTERNS[ext] || [];
    for (const pattern of patterns) {
        if (pattern.test(code)) {
            return res.json({
                success: false,
                output: "[Security Alert]: Potentially hazardous system operations or restricted libraries detected. Execution halted.",
            });
        }
    }

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    const runnerFilename = `runner_${uuidv4()}.${ext}`;
    const filepath = path.join(tmpDir, runnerFilename);
    const binaryPath = ext === "cpp" ? filepath.replace(".cpp", process.platform === "win32" ? ".exe" : ".out") : "";

    const cleanup = () => {
        try {
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            if (binaryPath && fs.existsSync(binaryPath)) fs.unlinkSync(binaryPath);
        } catch {
            // Ignore cleanup errors
        }
    };

    try {
        fs.writeFileSync(filepath, code, { encoding: "utf8", mode: 0o600 });

        let command = "";
        switch (ext) {
            case "js":
                command = `node "${filepath}"`;
                break;
            case "py":
                command = `python "${filepath}"`;
                break;
            case "cpp":
                command = `g++ "${filepath}" -o "${binaryPath}" && "${binaryPath}"`;
                break;
            default:
                command = `node "${filepath}"`;
                break;
        }

        exec(
            command,
            {
                timeout: 5000,
                maxBuffer: 1024 * 512,
                killSignal: "SIGKILL",
            },
            (error, stdout, stderr) => {
                cleanup();

                if (error && error.killed) {
                    return res.json({
                        success: false,
                        output: "[Execution Error]: Process exceeded maximum 5-second safety timeout limit.",
                    });
                }

                if (stderr) {
                    return res.json({
                        success: false,
                        output: stderr.slice(0, 4000),
                    });
                }

                return res.json({
                    success: true,
                    output: (stdout || "[Success]: Process executed cleanly with no output streams.").slice(0, 8000),
                });
            }
        );
    } catch (err) {
        cleanup();
        const errorMessage = err instanceof Error ? err.message : String(err);
        return res.status(500).json({ error: errorMessage });
    }
}

export default codeExecution;