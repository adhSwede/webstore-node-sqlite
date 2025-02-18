import { Request, Response, NextFunction } from "express";

/**
 * Centralized error handler for consistent API responses.
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.message || err);

  const statusCode = err.status || 500; // Default to 500 if status is missing

  res
    .status(statusCode)
    .json({ error: err.message || "Internal Server Error" });
};

export default errorHandler;
