import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";
import { handleDBError } from "../utils/errorUtils";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getProducts: RequestHandler = asyncHandler(async (req, res) => {
  let query = `
    SELECT 
      p.Product_ID, 
      p.Name AS Product_Name, 
      p.Stock, 
      p.Price,
      c.Name AS Category_Name,  
      GROUP_CONCAT(m.Name, ', ') AS Manufacturer_Names  
    FROM Products p
    LEFT JOIN Categories c ON p.Category_ID = c.Category_ID
    LEFT JOIN ProductManufacturers pm ON p.Product_ID = pm.Product_ID
    LEFT JOIN Manufacturers m ON pm.Manufacturer_ID = m.Manufacturer_ID
  `;

  const values: any[] = [];
  const conditions: string[] = [];

  const addFilter = (condition: string, value: any) => {
    conditions.push(condition);
    values.push(value);
  };

  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

  handleDBError(minPrice !== null && isNaN(minPrice), "Invalid minPrice", 400);
  handleDBError(maxPrice !== null && isNaN(maxPrice), "Invalid maxPrice", 400);

  if (minPrice !== null) addFilter("p.Price >= ?", minPrice);
  if (maxPrice !== null) addFilter("p.Price <= ?", maxPrice);

  // conditions only if filter input.
  if (conditions.length) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY p.Product_ID";

  res.json(db.prepare(query).all(...values));
});

const getProductById: RequestHandler = asyncHandler(async (req, res) => {
  const product = db
    .prepare(
      `SELECT 
        p.Product_ID, 
        p.Name, 
        p.Description, 
        p.Price, 
        p.Stock, 
        c.Name AS Category_Name 
      FROM Products p
      LEFT JOIN Categories c ON p.Category_ID = c.Category_ID
      WHERE p.Product_ID = ?`
    )
    .get(Number(req.params.id));

  handleDBError(!product, "Product not found", 404);
  res.json(product);
});

const getProductsByName: RequestHandler = asyncHandler(async (req, res) => {
  const searchTerm = req.query.name?.toString() || "";
  handleDBError(!searchTerm, "Search term is required", 400);

  const products = db
    .prepare(
      `SELECT 
        p.Product_ID, 
        p.Name, 
        p.Description, 
        p.Price, 
        p.Stock, 
        c.Name AS Category_Name 
      FROM Products p
      LEFT JOIN Categories c ON p.Category_ID = c.Category_ID
      WHERE p.Name LIKE ?`
    )
    .all(`%${searchTerm}%`);

  res.json(products);
});

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

const postProduct: RequestHandler = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  handleDBError(
    !name ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !category,
    "All fields, including category, are required",
    400
  );

  let categoryRow = db
    .prepare(`SELECT Category_ID FROM Categories WHERE Name = ?;`)
    .get(category) as { Category_ID: number } | undefined;

  if (!categoryRow) {
    const categoryResult = db
      .prepare(`INSERT INTO Categories (Name) VALUES (?);`)
      .run(category);
    categoryRow = { Category_ID: categoryResult.lastInsertRowid as number };
  }

  const result = db
    .prepare(
      `INSERT INTO Products (Name, Description, Price, Stock, Category_ID) 
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(name, description, price, stock, categoryRow.Category_ID);

  handleDBError(result.changes === 0, "Failed to insert product", 500);

  res.status(201).json({
    message: "Product created",
    product: {
      id: result.lastInsertRowid,
      name,
      description,
      price,
      stock,
      category: category,
    },
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
