# **Presentation**: Database Project

_2025-02-24_

**_`Warning: This is an AI translated version of my carefully crafted presentation for school, so don't be surprised if something is weird language wise.`_**

## Table of Contents

- [Database and SQL](#database-and-sql)
  - [Main Entities](#main-entities)
  - [Relationships](#relationships)
    - [One-to-many (`1-<`)](#one-to-many-1)
    - [One-to-one (`1-1`)](#one-to-one-1-1)
    - [Many-to-many (`>-<`)](#many-to-many)
- [Error Handling](#error-handling)
  - [Centralized Error Handling (`errorHandler.ts`)](#centralized-error-handling-errorhandlerts)
  - [Validation Error Handling (`handleDBError.ts`)](#validation-error-handling-handledberrorts)
  - [Asynchronous Error Handling (`asyncHandler.ts`)](#asynchronous-error-handling-asynchandlerts)
  - [Validation Example in an Endpoint](#validation-example-in-an-endpoint)
- [Extra Functionality for Higher Grade](#extra-functionality-for-higher-grade)

## Database and SQL

### Main Entities

The main entities in our database:

- `Products`
- `Customers`
- `Orders`
- `Categories`
- `Manufacturers`

These entities are linked through `FOREIGN KEYS`.

### Relationships

- **One-to-many (`1-<`)**: Customers and Orders.
- **One-to-one (`1-1`)**: Customers and Addresses.
- **Many-to-many (`>-<`)**: Products and Categories.

#### **One-to-many (`1-<`)**

**Example:** A customer can have multiple orders, but an order belongs to only one customer.

- **Each customer (`Customer_ID`)** can have **multiple** orders (`Order_ID`).
- **Each order (`Order_ID`)** belongs to exactly **one** customer.

##### Implementation:

```sql
CREATE TABLE Orders (
  Order_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Customer_ID INTEGER,
  FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE
);
```

`ON DELETE CASCADE` - If a customer is deleted, all related orders are also deleted.

#### **One-to-one (`1-1`)**

A customer has exactly **one** address, and **one** address belongs to **only one** customer.

- Each customer (`Customer_ID`) has a unique address (`Address_ID`).
- Each address (`Address_ID`) belongs to only one customer.

##### Implementation:

```sql
CREATE TABLE Addresses (
Address_ID INTEGER PRIMARY KEY AUTOINCREMENT,
Customer_ID INTEGER UNIQUE,
FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE
);
```

- `UNIQUE` - ensures that a customer can have only one address.
- `ON DELETE CASCADE` - If a customer is deleted, their address is also removed.

#### **Many-to-many (`>-<`)**

Products can belong to multiple categories, and categories can contain multiple products.

- A product (`Product_ID`) can belong to multiple categories.
- A category (`Category_ID`) can contain multiple products.

##### Implementation:

```sql
CREATE TABLE ProductCategories (
Product_ID INTEGER,
Category_ID INTEGER,
PRIMARY KEY (Product_ID, Category_ID),
FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
FOREIGN KEY (Category_ID) REFERENCES Categories(Category_ID) ON UPDATE CASCADE
);
```

- This join table manages the relationship between products and categories.
- `ON DELETE CASCADE` - If a product is deleted, its link to categories is also removed.

## Error Handling

### Centralized Error Handling (`errorHandler.ts`)

- **Why?**
  - Instead of using try-catch everywhere, a centralized error handler catches all errors.

##### Implementation:

```ts
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.stack || err);

  const statusCode =
    err.status && Number.isInteger(err.status) ? err.status : 500;

  res.status(statusCode).json({
    error:
      statusCode === 500
        ? "Internal Server Error"
        : err.message || "An error occurred",
  });
};

export default errorHandler;
```

## Extra Functionality for Higher Grade

### Advanced Filtering for Products

- **What does it do?**
  - "Users can search for products based on price range, name, or category."

##### Implementation:

```sql
SELECT * FROM Products WHERE Price BETWEEN ? AND ?;
```

- **Example API call in Postman:**

  - `GET /products?minPrice=100&maxPrice=500`
  - "This retrieves all products priced between 100 and 500."

- **Why is this useful?**
  - "Gives users flexibility to filter products based on their needs."

## Summary & Questions

- "In summary, I have built an API using SQLite and Express."
- "I have implemented relationships, validation, and extra functionality."
- **Any questions?**
