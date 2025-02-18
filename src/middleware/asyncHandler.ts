import { Request, Response, NextFunction } from "express";

/**
 * Wraps async route handlers to catch errors and forward them to Express error handling.
 */
const asyncHandler =
  <Req extends Request = Request, Res extends Response = Response>(
    fn: (req: Req, res: Res, next: NextFunction) => Promise<any>
  ) =>
  (req: Req, res: Res, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
