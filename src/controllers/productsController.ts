import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                Utility Function                            */
/* -------------------------------------------------------------------------- */

const handleDBError = (condition: boolean, message: string, status: number) => {
  if (condition) throw Object.assign(new Error(message), { status });
};

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getProducts: RequestHandler = asyncHandler(async (req, res) => {
  let query = `SELECT * FROM Products WHERE 1=1`;
  const values: any[] = [];

  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

  handleDBError(minPrice !== null && isNaN(minPrice), "Invalid minPrice", 400);
  handleDBError(maxPrice !== null && isNaN(maxPrice), "Invalid maxPrice", 400);

  if (minPrice !== null) {
    query += " AND Price >= ?";
    values.push(minPrice);
  }
  if (maxPrice !== null) {
    query += " AND Price <= ?";
    values.push(maxPrice);
  }

  res.json(db.prepare(query).all(...values));
});

const getProductById: RequestHandler = asyncHandler(async (req, res) => {
  const product = db
    .prepare(`SELECT * FROM Products WHERE Product_ID = ?`)
    .get(Number(req.params.id));

  handleDBError(!product, "Product not found", 404);
  res.json(product);
});

const getProductsByName: RequestHandler = asyncHandler(async (req, res) => {
  const searchTerm = req.query.name?.toString() || "";
  handleDBError(!searchTerm, "Search term is required", 400);

  res.json(
    db
      .prepare(`SELECT * FROM Products WHERE Name LIKE ?`)
      .all(`%${searchTerm}%`)
  );
});

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

const postProduct: RequestHandler = asyncHandler(async (req, res) => {
  const { name, description, price, stock } = req.body;
  handleDBError(
    !name || !description || price === undefined || stock === undefined,
    "All fields are required",
    400
  );

  const result = db
    .prepare(
      `
    INSERT INTO Products (Name, Description, Price, Stock) VALUES (?, ?, ?, ?)
  `
    )
    .run(name, description, price, stock);

  handleDBError(result.changes === 0, "Failed to insert product", 500);

  res.status(201).json({
    message: "Product created",
    product: { id: result.lastInsertRowid, name, description, price, stock },
  });
});

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

const updateProduct: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { price, stock } = req.body;

  handleDBError(
    price === undefined && stock === undefined,
    "At least one field required (price or stock)",
    400
  );

  const fields = [];
  const values: (number | string)[] = [];

  if (price !== undefined) {
    const parsedPrice = Number(price);
    handleDBError(isNaN(parsedPrice), "Invalid price", 400);
    fields.push("Price = ?");
    values.push(parsedPrice);
  }

  if (stock !== undefined) {
    const parsedStock = Number(stock);
    handleDBError(isNaN(parsedStock), "Invalid stock", 400);
    fields.push("Stock = ?");
    values.push(parsedStock);
  }

  values.push(id);
  const sql = `UPDATE Products SET ${fields.join(", ")} WHERE Product_ID = ?;`;
  const result = db.prepare(sql).run(...values);

  handleDBError(
    result.changes === 0,
    "Product not found or no changes made",
    404
  );

  res.json({ message: "Product updated successfully" });
});

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */

const deleteProduct: RequestHandler = asyncHandler(async (req, res) => {
  const result = db
    .prepare(`DELETE FROM Products WHERE Product_ID = ?`)
    .run(req.params.id);

  handleDBError(result.changes === 0, "Product not found", 404);
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
