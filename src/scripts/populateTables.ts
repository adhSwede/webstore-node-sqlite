import { db } from "../database/db";
import productsArray from "./Data/productsArray";
import customersArray from "./Data/customersArray";
import addressesArray from "./Data/addressesArray";
import ordersArray from "./Data/ordersArray";
import orderDetailsArray from "./Data/orderDetailsArray";
import reviewsArray from "./Data/reviewsArray";

// Executes SQL queries inside a transaction with error handling
const insertData = (query: string, params: any[], logMessage: string) => {
  try {
    db.prepare(query).run(...params);
    console.log(logMessage);
    return true;
  } catch (err) {
    console.error("Insert error:", err);
    return false;
  }
};

/* -------------------------------------------------------------------------- */
/*                                Insert Customers                            */
/* -------------------------------------------------------------------------- */
const insertCustomers = db.transaction(() => {
  customersArray.forEach((customer) => {
    insertData(
      `INSERT INTO Customers (FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?);`,
      [customer.FirstName, customer.LastName, customer.Email, customer.Phone],
      `Added Customer: "${customer.FirstName} ${customer.LastName}"`
    );
  });
});
insertCustomers();

/* -------------------------------------------------------------------------- */
/*                                Insert Addresses                            */
/* -------------------------------------------------------------------------- */
const insertAddresses = db.transaction(() => {
  addressesArray.forEach((address) => {
    insertData(
      `INSERT INTO Addresses (Customer_ID, Street, City, State, ZipCode) VALUES (?, ?, ?, ?, ?);`,
      [
        address.Customer_ID,
        address.Street,
        address.City,
        address.State,
        address.ZipCode,
      ],
      `Added Address for Customer ${address.Customer_ID}`
    );
  });
});
insertAddresses();

/* -------------------------------------------------------------------------- */
/*                                Insert Products                             */
/* -------------------------------------------------------------------------- */
const insertProducts = db.transaction(() => {
  productsArray.forEach((product) => {
    let manufacturer = db
      .prepare(`SELECT Manufacturer_ID FROM Manufacturers WHERE Name = ?;`)
      .get(product.manufacturer) as { Manufacturer_ID: number } | undefined;

    if (!manufacturer) {
      const result = db
        .prepare(`INSERT INTO Manufacturers (Name) VALUES (?);`)
        .run(product.manufacturer);
      manufacturer = { Manufacturer_ID: result.lastInsertRowid as number };
    }

    let category = db
      .prepare(`SELECT Category_ID FROM Categories WHERE Name = ?;`)
      .get(product.category) as { Category_ID: number } | undefined;

    if (!category) {
      const result = db
        .prepare(`INSERT INTO Categories (Name) VALUES (?);`)
        .run(product.category);
      category = { Category_ID: result.lastInsertRowid as number };
    }

    const productResult = db
      .prepare(
        `INSERT INTO Products (Name, Description, Price, Stock) VALUES (?, ?, ?, ?);`
      )
      .run(product.name, product.description, product.price, product.stock);

    const productId = productResult.lastInsertRowid as number;
    console.log(`Added Product: ${product.name} (ID: ${productId})`);

    if (category) {
      insertData(
        `INSERT INTO ProductCategories (Product_ID, Category_ID) VALUES (?, ?);`,
        [productId, category.Category_ID],
        `Linked Product ${productId} to Category ${category.Category_ID}`
      );
    }

    if (manufacturer) {
      insertData(
        `INSERT INTO ProductManufacturers (Product_ID, Manufacturer_ID) VALUES (?, ?);`,
        [productId, manufacturer.Manufacturer_ID],
        `Linked Product ${productId} to Manufacturer ${manufacturer.Manufacturer_ID}`
      );
    }
  });
});
insertProducts();

/* -------------------------------------------------------------------------- */
/*                                Insert Orders                               */
/* -------------------------------------------------------------------------- */
const insertOrders = db.transaction(() => {
  ordersArray.forEach((order) => {
    const result = db
      .prepare(
        `INSERT INTO Orders (Customer_ID, Address_ID, OrderDate, TotalAmount, Status) 
      VALUES (?, ?, ?, ?, ?);`
      )
      .run(
        order.Customer_ID,
        order.Address_ID,
        order.OrderDate,
        order.TotalAmount,
        order.Status
      );

    const orderId = result.lastInsertRowid as number;
    console.log(`Added Order: ${orderId} for Customer ${order.Customer_ID}`);
  });
});
insertOrders();

/* -------------------------------------------------------------------------- */
/*                             Insert Order Details                           */
/* -------------------------------------------------------------------------- */
const insertOrderDetails = db.transaction(() => {
  orderDetailsArray.forEach((orderDetail) => {
    insertData(
      `INSERT INTO OrderDetails (Order_ID, Product_ID, Quantity, UnitPrice, PriceAtPurchase, Discount) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        orderDetail.Order_ID,
        orderDetail.Product_ID,
        orderDetail.Quantity,
        orderDetail.UnitPrice,
        orderDetail.PriceAtPurchase,
        orderDetail.Discount,
      ],
      `Added OrderDetail: Order ${orderDetail.Order_ID}, Product ${orderDetail.Product_ID}`
    );
  });
});
insertOrderDetails();

/* -------------------------------------------------------------------------- */
/*                                Insert Reviews                              */
/* -------------------------------------------------------------------------- */
const insertReviews = db.transaction(() => {
  reviewsArray.forEach((review) => {
    insertData(
      `INSERT INTO Reviews (Customer_ID, Product_ID, Order_ID, Rating, Comment) 
       VALUES (?, ?, ?, ?, ?);`,
      [
        review.Customer_ID,
        review.Product_ID,
        review.Order_ID,
        review.Rating,
        review.Comment,
      ],
      `Added Review: ${review.Rating} stars for Product ${review.Product_ID} by Customer ${review.Customer_ID}`
    );
  });
});
insertReviews();
