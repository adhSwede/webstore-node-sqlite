import { Request, Response, NextFunction } from "express";
import colors from "colors";

/**
 * Middleware to log incoming requests with method, URL, and timestamp.
 */
const logger = (req: Request, res: Response, next: NextFunction) => {
  if (!req.method || !req.url) return next(); // Skip logging if request data is missing

  const methodColors = {
    GET: "green",
    POST: "yellow",
    PUT: "blue",
    DELETE: "red",
  } as const;

  const method = req.method.toUpperCase() as keyof typeof methodColors;
  const logColor = colors[methodColors[method] || "white"];

  const timestamp = new Date().toISOString();
  const fullUrl = `${req.protocol}://${req.get("host") || "unknown"}${
    req.originalUrl
  }`;

  console.log(logColor(`[${timestamp}] ${req.method} ${fullUrl}`));

  next();
};

export default logger;
