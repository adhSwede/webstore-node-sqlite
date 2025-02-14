import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

const getProducts = asyncHandler(async (req, res, next) => {
  const stmt = db.prepare(`SELECT * FROM products`);
  const products = stmt.all();
  res.json(products);
});

const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const stmt = db.prepare(`SELECT * FROM products WHERE product_id = ?`);
  const product = stmt.get(Number(id));

  if (!product) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  res.json(product);
});

export { getProducts, getProductById };
