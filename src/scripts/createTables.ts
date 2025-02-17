import { db } from "../database/db";

// Enable foreign key constraints
db.exec("PRAGMA foreign_keys = ON;");

// Function to execute SQL safely
const executeSQL = (query: string) => {
  try {
    db.prepare(query).run();
  } catch (err) {
    console.error("Error executing query:", err);
  }
};

const createTables = () => {
  try {
    // Customers table
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Customers (
        Customer_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT,
        LastName TEXT,
        Email TEXT UNIQUE,
        Phone TEXT CHECK (Phone GLOB '[0-9]*' AND LENGTH(Phone) BETWEEN 7 AND 15)
      );
    `);

    // Addresses table (linked to Customers)
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Addresses (
        Address_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Customer_ID INTEGER,
        Street TEXT,
        City TEXT,
        ZipCode TEXT,
        State TEXT,
        Country TEXT,
        FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE
      );
    `);

    // Orders table (linked to Customers & Addresses)
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Orders (
        Order_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Customer_ID INTEGER,
        Address_ID INTEGER,
        OrderDate TEXT DEFAULT (DATE('now')),
        TotalAmount REAL DEFAULT 0,
        Status TEXT DEFAULT 'Pending',
        FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE,
        FOREIGN KEY (Address_ID) REFERENCES Addresses(Address_ID) ON DELETE CASCADE
      );
    `);

    // Products table
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Products (
        Product_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT,
        Description TEXT,
        Price REAL CHECK (Price > 0),
        Stock INTEGER
      );
    `);

    executeSQL(
      `CREATE INDEX IF NOT EXISTS idx_products_name ON Products(Name);`
    );
    executeSQL(
      `CREATE INDEX IF NOT EXISTS idx_products_description ON Products(Description);`
    );

    // Categories table
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Categories (
        Category_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT,
        Description TEXT
      );
    `);

    // Manufacturers table
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Manufacturers (
        Manufacturer_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT,
        Description TEXT
      );
    `);

    // ProductCategories (Many-to-Many: Products ↔ Categories)
    executeSQL(`
      CREATE TABLE IF NOT EXISTS ProductCategories (
        Product_ID INTEGER,
        Category_ID INTEGER,
        PRIMARY KEY (Product_ID, Category_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
        FOREIGN KEY (Category_ID) REFERENCES Categories(Category_ID) ON UPDATE CASCADE
      );
    `);

    // ProductManufacturers (Many-to-Many: Products ↔ Manufacturers)
    executeSQL(`
      CREATE TABLE IF NOT EXISTS ProductManufacturers (
        Product_ID INTEGER,
        Manufacturer_ID INTEGER,
        PRIMARY KEY (Product_ID, Manufacturer_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
        FOREIGN KEY (Manufacturer_ID) REFERENCES Manufacturers(Manufacturer_ID)
      );
    `);

    // OrderDetails (Many-to-Many: Orders ↔ Products)
    executeSQL(`
      CREATE TABLE IF NOT EXISTS OrderDetails (
        Order_ID INTEGER,
        Product_ID INTEGER,
        Quantity INTEGER,
        UnitPrice NUMERIC,
        PriceAtPurchase NUMERIC,
        Discount NUMERIC,
        PRIMARY KEY (Order_ID, Product_ID),
        FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE
      );
    `);

    // Reviews (linked to Customers, Products, and Orders)
    executeSQL(`
      CREATE TABLE IF NOT EXISTS Reviews (
        Review_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Customer_ID INTEGER,
        Product_ID INTEGER,
        Order_ID INTEGER,
        Rating INTEGER NOT NULL CHECK (Rating BETWEEN 1 AND 5),
        Comment TEXT,
        FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID),
        FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
        FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID)
      );
    `);

    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    db.close();
  }
};

createTables();
