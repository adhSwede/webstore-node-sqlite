import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";
import { handleDBError } from "../utils/errorUtils";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getCategoryById: RequestHandler = asyncHandler(async (req, res) => {
  const categoryId = parseInt(req.params.id, 10);
  handleDBError(isNaN(categoryId), "Invalid category ID", 400);

  const stmt = db.prepare(`
    SELECT c.Category_ID, c.Name, p.Product_ID, p.Name AS ProductName
    FROM Categories c
    LEFT JOIN ProductCategories pc ON c.Category_ID = pc.Category_ID
    LEFT JOIN Products p ON pc.Product_ID = p.Product_ID
    WHERE c.Category_ID = ?;
  `);

  const result = stmt.all(categoryId);
  handleDBError(result.length === 0, "Category not found", 404);

  res.json(result);
});

const getCategoryStats: RequestHandler = asyncHandler(async (_, res) => {
  const stats = db
    .prepare(
      `
      SELECT 
        c.Name AS Category, 
        COUNT(p.Product_ID) AS ProductCount, 
        ROUND(COALESCE(AVG(p.Price), 0), 2) AS AvgPrice
      FROM Categories c
      LEFT JOIN Products p ON c.Category_ID = p.Category_ID
      GROUP BY c.Category_ID;
      `
    )
    .all();

  res.json({ CategoryStats: stats });
});

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

const updateCategory: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { Category_ID, Name } = req.body;

  handleDBError(isNaN(id), "Invalid category ID", 400);
  handleDBError(
    Category_ID === undefined && !Name,
    "No valid fields provided",
    400
  );

  const result = db
    .prepare(
      `
    UPDATE Categories 
    SET Category_ID = COALESCE(?, Category_ID), Name = COALESCE(?, Name)
    WHERE Category_ID = ?;
  `
    )
    .run(Category_ID, Name, id);

  handleDBError(
    result.changes === 0,
    "Category not found or no changes made",
    404
  );

  res.json({ message: "Category updated successfully." });
});

export { getCategoryById, getCategoryStats, updateCategory };
