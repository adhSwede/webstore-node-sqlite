import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getProducts: RequestHandler = asyncHandler(async (req, res, next) => {
  let query = `SELECT * FROM Products WHERE 1=1`;
  const values: any[] = [];

  // Parse and validate query parameters
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

  if (minPrice !== null && isNaN(minPrice))
    throw Object.assign(new Error("Invalid minPrice"), { status: 400 });
  if (maxPrice !== null && isNaN(maxPrice))
    throw Object.assign(new Error("Invalid maxPrice"), { status: 400 });

  // Apply filters if provided
  if (minPrice !== null) {
    query += " AND Price >= ?";
    values.push(minPrice);
  }
  if (maxPrice !== null) {
    query += " AND Price <= ?";
    values.push(maxPrice);
  }

  const stmt = db.prepare(query);
  res.json(stmt.all(...values));
});

const getProductById: RequestHandler = asyncHandler(async (req, res, next) => {
  const stmt = db.prepare(`SELECT * FROM Products WHERE Product_ID = ?`);
  const product = stmt.get(Number(req.params.id));

  if (!product)
    throw Object.assign(new Error("Product not found"), { status: 404 }); // No match found
  res.json(product);
});

const getProductsByName: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const searchTerm = req.query.name?.toString() || "";
    if (!searchTerm)
      throw Object.assign(new Error("Search term is required"), {
        status: 400,
      });

    const stmt = db.prepare(`SELECT * FROM Products WHERE Name LIKE ?`);
    res.json(stmt.all(`%${searchTerm}%`));
  }
);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

const postProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, stock } = req.body;
  if (!name || !description || price === undefined || stock === undefined) {
    throw Object.assign(new Error("All fields are required"), { status: 400 });
  }

  const stmt = db.prepare(`
    INSERT INTO Products (Name, Description, Price, Stock)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(name, description, price, stock);
  if (result.changes === 0)
    throw Object.assign(new Error("Failed to insert product"), { status: 500 });

  res
    .status(201)
    .json({
      message: "Product created",
      product: { id: result.lastInsertRowid, name, description, price, stock },
    });
});

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { price, stock } = req.body;

  if (price === undefined && stock === undefined) {
    throw Object.assign(
      new Error("At least one field required (price or stock)"),
      { status: 400 }
    );
  }

  // Prepare update statement dynamically
  const fields: string[] = [];
  const values: (number | string)[] = [];

  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice))
      throw Object.assign(new Error("Invalid price"), { status: 400 });
    fields.push("Price = ?");
    values.push(parsedPrice);
  }

  if (stock !== undefined) {
    const parsedStock = Number(stock);
    if (isNaN(parsedStock))
      throw Object.assign(new Error("Invalid stock"), { status: 400 });
    fields.push("Stock = ?");
    values.push(parsedStock);
  }

  values.push(id);
  const sql = `UPDATE Products SET ${fields.join(", ")} WHERE Product_ID = ?;`;

  const stmt = db.prepare(sql);
  const result = stmt.run(...values);
  if (result.changes === 0)
    throw Object.assign(new Error("Product not found or no changes made"), {
      status: 404,
    });

  res.json({ message: "Product updated successfully" });
});

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */

const deleteProduct = asyncHandler(async (req, res, next) => {
  const stmt = db.prepare(`DELETE FROM Products WHERE Product_ID = ?`);
  const result = stmt.run(req.params.id);

  if (result.changes === 0)
    throw Object.assign(new Error("Product not found"), { status: 404 }); // No match found
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
