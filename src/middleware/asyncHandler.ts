import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle async errors in Express routes.
 * Automatically catches errors and passes them to Express error handling.
 */
const asyncHandler = <
  Req extends Request = Request,
  Res extends Response = Response
>(
  fn: (req: Req, res: Res, next: NextFunction) => Promise<any>
) => {
  return (req: Req, res: Res, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
