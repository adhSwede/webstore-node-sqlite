import { db } from "../database/db";

// Enable foreign key constraints
db.exec("PRAGMA foreign_keys = ON;");

// Executes SQL queries safely and returns success/failure
const executeSQL = (query: string): boolean => {
  try {
    db.prepare(query).run();
    return true;
  } catch (err) {
    console.error("Error executing query:", err);
    return false;
  }
};

const createTables = () => {
  try {
    db.exec("BEGIN TRANSACTION;"); // Start transaction

    // Customers & Addresses
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Customers (
        Customer_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT NOT NULL,
        LastName TEXT NOT NULL,
        Email TEXT UNIQUE NOT NULL,
        Phone TEXT CHECK (Phone GLOB '[0-9]*' AND LENGTH(Phone) BETWEEN 7 AND 15)
      );
    `);

    executeSQL(`
      CREATE TABLE IF NOT EXISTS Addresses (
        Address_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Customer_ID INTEGER NOT NULL,
        Street TEXT NOT NULL,
        City TEXT NOT NULL,
        ZipCode TEXT NOT NULL,
        State TEXT NOT NULL,
        Country TEXT NOT NULL,
        FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE
      );
    `);

    // Orders
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Orders (
        Order_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Customer_ID INTEGER NOT NULL,
        Address_ID INTEGER NOT NULL,
        OrderDate TEXT DEFAULT (DATE('now')),
        TotalAmount REAL DEFAULT 0 CHECK (TotalAmount >= 0),
        Status TEXT DEFAULT 'Pending',
        FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE,
        FOREIGN KEY (Address_ID) REFERENCES Addresses(Address_ID) ON DELETE CASCADE
      );
    `);

    // Products, Categories & Manufacturers
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Products (
        Product_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        Description TEXT,
        Price REAL CHECK (Price > 0) NOT NULL,
        Stock INTEGER CHECK (Stock >= 0) NOT NULL
      );
    `);

    executeSQL(
      `CREATE INDEX IF NOT EXISTS idx_products_name ON Products(Name);`
    );
    executeSQL(
      `CREATE INDEX IF NOT EXISTS idx_products_description ON Products(Description);`
    );

    executeSQL(`
      CREATE TABLE IF NOT EXISTS Categories (
        Category_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        Description TEXT
      );
    `);

    executeSQL(`
      CREATE TABLE IF NOT EXISTS Manufacturers (
        Manufacturer_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        Description TEXT
      );
    `);

    // Many-to-Many Relationships
    executeSQL(`
      CREATE TABLE IF NOT EXISTS ProductCategories (
        Product_ID INTEGER NOT NULL,
        Category_ID INTEGER NOT NULL,
        PRIMARY KEY (Product_ID, Category_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
        FOREIGN KEY (Category_ID) REFERENCES Categories(Category_ID) ON UPDATE CASCADE
      );
    `);

    executeSQL(`
      CREATE TABLE IF NOT EXISTS ProductManufacturers (
        Product_ID INTEGER NOT NULL,
        Manufacturer_ID INTEGER NOT NULL,
        PRIMARY KEY (Product_ID, Manufacturer_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
        FOREIGN KEY (Manufacturer_ID) REFERENCES Manufacturers(Manufacturer_ID)
      );
    `);

    executeSQL(`
      CREATE TABLE IF NOT EXISTS OrderDetails (
        Order_ID INTEGER NOT NULL,
        Product_ID INTEGER NOT NULL,
        Quantity INTEGER CHECK (Quantity > 0) NOT NULL,
        UnitPrice REAL CHECK (UnitPrice >= 0) NOT NULL,
        PriceAtPurchase REAL CHECK (PriceAtPurchase >= 0) NOT NULL,
        Discount REAL CHECK (Discount BETWEEN 0 AND 1),
        PRIMARY KEY (Order_ID, Product_ID),
        FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE
      );
    `);

    // Reviews
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Reviews (
        Review_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Customer_ID INTEGER NOT NULL,
        Product_ID INTEGER NOT NULL,
        Order_ID INTEGER NOT NULL,
        Rating INTEGER CHECK (Rating BETWEEN 1 AND 5) NOT NULL,
        Comment TEXT,
        FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
        FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID)
      );
    `);

    db.exec("COMMIT;"); // Commit transaction if all queries succeed
    console.log("All tables created successfully!");
  } catch (err) {
    db.exec("ROLLBACK;"); // Rollback if any query fails
    console.error("Error creating tables, transaction rolled back:", err);
  } finally {
    db.close(); // Ensure DB is closed only after everything runs
  }
};

createTables();
