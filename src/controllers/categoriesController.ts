import { RequestHandler } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { db } from "../database/db";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

// Get a category along with its associated products
const getCategoryById: RequestHandler = asyncHandler(async (req, res, next) => {
  const categoryId = parseInt(req.params.id, 10);

  if (isNaN(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

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

  if (result.length === 0) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.json(result);
});

// Get statistics for categories, including product count and average price
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

    const stats = stmt.all() as {
      Category: string;
      ProductCount: number;
      AvgPrice: number | null;
    }[];

    res.json({ CategoryStats: stats });
  }
);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

// Update a category's name or ID, triggering CASCADE UPDATE if ID changes
const updateCategory: RequestHandler = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { Category_ID, Name } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid category ID." });
  }

  if (Category_ID === undefined && !Name) {
    return res
      .status(400)
      .json({ error: "No valid fields provided for update." });
  }

  console.log("Updating category:", { id, Category_ID, Name });

  const result = db
    .prepare(
      `UPDATE Categories 
       SET Category_ID = COALESCE(?, Category_ID),
           Name = COALESCE(?, Name)
       WHERE Category_ID = ?;`
    )
    .run(Category_ID, Name, id);

  console.log("Update result:", result);

  if (result.changes === 0) {
    return res
      .status(404)
      .json({ error: "Category not found or no changes made." });
  }

  res.json({ message: "Category updated successfully." });
});

export { getCategoryById, getCategoryStats, updateCategory };
