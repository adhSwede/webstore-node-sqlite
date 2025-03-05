import { Request, Response, NextFunction } from "express";
import colors from "colors";

// Middleware to log incoming requests.
// I used "colors" package to differentiate different calls.
const logger = (req: Request, res: Response, next: NextFunction) => {
  const methodColors: Record<string, keyof colors.Color> = {
    GET: "green",
    POST: "yellow",
    PUT: "blue",
    DELETE: "red",
  };

  const logColor = colors[methodColors[req.method] || "white"];
  const timestamp = new Date().toISOString();
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  console.log(logColor(`[${timestamp}] ${req.method} ${fullUrl}`));

  next();
};

export default logger;
