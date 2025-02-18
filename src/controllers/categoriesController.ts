import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getCategoryById: RequestHandler = asyncHandler(async (req, res, next) => {
  const categoryId = parseInt(req.params.id, 10);
  if (isNaN(categoryId))
    throw Object.assign(new Error("Invalid category ID"), { status: 400 });

  const stmt = db.prepare(`
    SELECT 
      c.Category_ID, 
      c.Name AS CategoryName, 
      p.Product_ID, 
      p.Name AS ProductName
    FROM Categories c
    LEFT JOIN ProductCategories pc ON c.Category_ID = pc.Category_ID
    LEFT JOIN Products p ON pc.Product_ID = p.Product_ID
    WHERE c.Category_ID = ?;
  `);

  const result = stmt.all(categoryId);
  if (result.length === 0)
    throw Object.assign(new Error("Category not found"), { status: 404 }); // If no rows, category doesn't exist

  res.json(result);
});

const getCategoryStats: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const stmt = db.prepare(`
    SELECT 
      c.Name AS Category, 
      COUNT(p.Product_ID) AS ProductCount, 
      ROUND(AVG(p.Price), 2) AS AvgPrice
    FROM Categories c
    LEFT JOIN ProductCategories pc ON c.Category_ID = pc.Category_ID
    LEFT JOIN Products p ON pc.Product_ID = p.Product_ID
    GROUP BY c.Category_ID;
  `);

    const stats = stmt.all();
    res.json({ CategoryStats: stats }); // AVG(p.Price) may return NULL if no products
  }
);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

const updateCategory: RequestHandler = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { Category_ID, Name } = req.body;

  if (isNaN(id))
    throw Object.assign(new Error("Invalid category ID."), { status: 400 });
  if (Category_ID === undefined && !Name)
    throw Object.assign(new Error("No valid fields provided."), {
      status: 400,
    });

  const result = db
    .prepare(
      `
    UPDATE Categories 
    SET 
      Category_ID = COALESCE(?, Category_ID),
      Name = COALESCE(?, Name)
    WHERE Category_ID = ?;
  `
    )
    .run(Category_ID, Name, id);

  if (result.changes === 0)
    throw Object.assign(new Error("Category not found or no changes made."), {
      status: 404,
    }); // No update, either missing or unchanged

  res.json({ message: "Category updated successfully." });
});

export { getCategoryById, getCategoryStats, updateCategory };
