import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getReviewStats: RequestHandler = asyncHandler(async (req, res, next) => {
  const stmt = db.prepare(`
    SELECT 
      p.Name AS Product,
      ROUND(AVG(r.Rating), 2) AS AvgRating
    FROM Products p
    LEFT JOIN Reviews r ON p.Product_ID = r.Product_ID
    GROUP BY p.Product_ID;
  `);

  const stats = stmt.all(); // Returns empty array if no reviews exist

  res.json({ ReviewStats: stats });
});

export { getReviewStats };
