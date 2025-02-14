import { db } from "../database/db";
import productsArray from "./productsArray";

const addProduct = db.transaction((product) => {
  // Check if manufacturer exists
  const manufacturerRow = db
    .prepare(`SELECT Manufacturer_ID FROM Manufacturers WHERE Name = ?;`)
    .get(product.manufacturer) as { Manufacturer_ID: number } | undefined;

  let manufacturerId = manufacturerRow
    ? manufacturerRow.Manufacturer_ID
    : undefined;

  if (!manufacturerId) {
    const result = db
      .prepare(
        `INSERT INTO Manufacturers (Name) VALUES (?) RETURNING Manufacturer_ID;`
      )
      .get(product.manufacturer) as { Manufacturer_ID: number } | undefined;
    manufacturerId = result ? result.Manufacturer_ID : undefined;
  }

  // Check if category exists
  const categoryRow = db
    .prepare(`SELECT Category_ID FROM Categories WHERE Name = ?;`)
    .get(product.category) as { Category_ID: number } | undefined;

  let categoryId = categoryRow ? categoryRow.Category_ID : undefined;

  if (!categoryId) {
    const result = db
      .prepare(
        `INSERT INTO Categories (Name) VALUES (?) RETURNING Category_ID;`
      )
      .get(product.category) as { Category_ID: number } | undefined;
    categoryId = result ? result.Category_ID : undefined;
  }

  // Insert product and get ID
  const productRow = db
    .prepare(
      `INSERT INTO Products (Name, Description, Price, Stock) VALUES (?, ?, ?, ?) RETURNING Product_ID;`
    )
    .get(product.name, product.description, product.price, product.stock) as
    | { Product_ID: number }
    | undefined;

  const productId = productRow ? productRow.Product_ID : undefined;

  if (productId && categoryId) {
    db.prepare(
      `INSERT INTO ProductCategories (Product_ID, Category_ID) VALUES (?, ?);`
    ).run(productId, categoryId);
  }

  if (productId && manufacturerId) {
    db.prepare(
      `INSERT INTO ProductManufacturers (Product_ID, Manufacturer_ID) VALUES (?, ?);`
    ).run(productId, manufacturerId);
  }

  console.log(`Added Product: "${product.name}"`);
});

productsArray.forEach(addProduct);
