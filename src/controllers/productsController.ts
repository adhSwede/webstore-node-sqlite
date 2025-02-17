import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

// Get all products
const getProducts: RequestHandler = asyncHandler(async (req, res, next) => {
  const stmt = db.prepare(`SELECT * FROM Products`);
  const products = stmt.all();
  res.json(products);
});

// Get a single product by ID
const getProductById: RequestHandler = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const stmt = db.prepare(`SELECT * FROM Products WHERE Product_ID = ?`);
  const product = stmt.get(Number(id));

  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  res.json(product);
});

// Search for products by name
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

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

// Add a new product
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

// Update product price or stock
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { price, stock } = req.body;

  if (price === undefined && stock === undefined) {
    return res.status(400).json({
      message: "At least one field (price or stock) must be provided",
    });
  }

  const parsedPrice = price !== undefined ? Number(price) : undefined;
  const parsedStock = stock !== undefined ? Number(stock) : undefined;

  const fields: string[] = [];
  const values: (number | string)[] = [];

  if (parsedPrice !== undefined) {
    fields.push("Price = ?");
    values.push(parsedPrice);
  }
  if (parsedStock !== undefined) {
    fields.push("Stock = ?");
    values.push(parsedStock);
  }

  values.push(id);

  const sql = `
    UPDATE Products
    SET ${fields.join(", ")}
    WHERE Product_ID = ?;
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

// Delete a product by ID
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
  postProduct,
  updateProduct,
  deleteProduct,
};
