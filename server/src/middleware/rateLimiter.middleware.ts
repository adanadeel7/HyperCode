import rateLimit from "express-rate-limit";

const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many execution requests. Please wait a moment before trying again.",
  },
});

export { executeLimiter };
