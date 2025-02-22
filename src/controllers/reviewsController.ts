import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getReviewStats: RequestHandler = asyncHandler(async (_, res) => {
  res.json({
    ReviewStats: db
      .prepare(
        `
      SELECT 
        p.Name AS Product,
        ROUND(AVG(r.Rating), 2) AS AvgRating
      FROM Products p
      LEFT JOIN Reviews r ON p.Product_ID = r.Product_ID
      GROUP BY p.Product_ID;
    `
      )
      .all(),
  });
});

export { getReviewStats };
