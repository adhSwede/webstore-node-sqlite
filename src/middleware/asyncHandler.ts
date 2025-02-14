import { Request, Response, NextFunction } from "express";

/**
 * A wrapper function that catches async errors and infers types automatically.
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
