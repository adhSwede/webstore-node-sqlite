import Database from "better-sqlite3";
const db = new Database("webshop.db", { verbose: console.log });

// Add a product
const addProduct = (name: string, description: string, price: number, stock: number): void => {
  try {
    const statement = db.prepare(
      `INSERT INTO Products (Name, Description, Price, Stock) VALUES (?, ?, ?, ?)`
    );

    const info = statement.run(name, description, price, stock);
    console.log(
      `Added Product: "${name}" with ID ${info.lastInsertRowid}`
    );
  } catch (error: any) {
    console.error(`Error! Product could not be added: ${error.message}`);
  }
};

addProduct("Apple MacBook Pro 14-inch (2025)", "The latest MacBook Pro with M4 chip, 16GB RAM, and 512GB SSD.", 2499, 50);
addProduct("Samsung Galaxy S24 Ultra", "Flagship smartphone with a 6.8-inch display, 12GB RAM, and 256GB storage.", 1199, 100);
addProduct("Dell XPS 13 (2025)", "Compact and powerful laptop with Intel i7 processor, 16GB RAM, and 1TB SSD.", 1799, 75);