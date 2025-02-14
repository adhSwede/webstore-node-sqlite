import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
// GET all products
const getProducts: RequestHandler = asyncHandler(async (req, res, next) => {
  const stmt = db.prepare(`SELECT * FROM Products`);
  const products = stmt.all();
  res.json(products);
});

// GET product by ID
const getProductById: RequestHandler = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const stmt = db.prepare(`SELECT * FROM Products WHERE Product_ID = ?`);
  const product = stmt.get(Number(id));

  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  res.json(product);
});

// GET products by name (search)
const getProductsByName: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const searchTerm = req.query.name?.toString() || "";

    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required." });
    }

    const stmt = db.prepare(`SELECT * FROM Products WHERE Name LIKE ?`);
    const products = stmt.all(`%${searchTerm}%`);

    res.json(products);
  }
);

// GET products by category ID
const getCategoryById = asyncHandler(async (req, res, next) => {
  const categoryId = parseInt(req.params.catid, 10);

  if (isNaN(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  const stmt = db.prepare(`
    SELECT 
      c.Category_ID, 
      c.Name, 
      p.Product_ID, 
      p.Name 
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

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
// POST new product
const postProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, stock } = req.body;

  if (!name || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const stmt = db.prepare(`
    INSERT INTO Products (Name, Description, Price, Stock)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(name, description, price, stock);

  if (result.changes === 0) {
    return res.status(500).json({ message: "Failed to insert product" });
  }

  res.status(201).json({
    message: "Product created successfully",
    product: { id: result.lastInsertRowid, name, description, price, stock },
  });
});

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */
// PUT (Edit) existing product
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { price, stock } = req.body;

  // One field needed for update
  if (price === undefined && stock === undefined) {
    return res.status(400).json({
      message: "At least one field (price or stock) must be provided",
    });
  }

  // SQL based on provided info.
  const fields: string[] = [];
  const values: (number | string)[] = [];

  if (price !== undefined) {
    fields.push("Price = ?");
    values.push(price);
  }
  if (stock !== undefined) {
    fields.push("Stock = ?");
    values.push(stock);
  }

  values.push(id);

  const sql = `
    UPDATE Products
    SET ${fields.join(", ")}
    WHERE Product_ID = ?
  `;

  const stmt = db.prepare(sql);
  const result = stmt.run(...values);

  if (result.changes === 0) {
    return res
      .status(404)
      .json({ message: "Product not found or no changes made" });
  }

  res.json({ message: "Product updated successfully" });
});

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */
// DELETE product
const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Products WHERE Product_ID = ?`);
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json({ message: "Product deleted successfully" });
});

export {
  getProducts,
  getProductById,
  getProductsByName,
  getCategoryById,
  postProduct,
  updateProduct,
  deleteProduct,
};
