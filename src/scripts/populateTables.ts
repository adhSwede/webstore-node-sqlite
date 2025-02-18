import { db } from "../database/db";
import productsArray from "./Data/productsArray";
import customersArray from "./Data/customersArray";
import addressesArray from "./Data/addressesArray";
import ordersArray from "./Data/ordersArray";
import orderDetailsArray from "./Data/orderDetailsArray";
import reviewsArray from "./Data/reviewsArray";

// Executes insert queries inside a transaction
const insertData = (query: string, params: any[], logMessage: string) => {
  try {
    db.prepare(query).run(...params);
    console.log(logMessage);
  } catch (err) {
    console.error("Insert error:", err);
  }
};

/* -------------------------------------------------------------------------- */
/*                                Insert Customers                            */
/* -------------------------------------------------------------------------- */
const addCustomer = db.transaction((customer) => {
  insertData(
    `INSERT INTO Customers (FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?);`,
    [customer.FirstName, customer.LastName, customer.Email, customer.Phone],
    `Added Customer: "${customer.FirstName} ${customer.LastName}"`
  );
});
customersArray.forEach(addCustomer);

/* -------------------------------------------------------------------------- */
/*                                Insert Addresses                            */
/* -------------------------------------------------------------------------- */
const addAddress = db.transaction((address) => {
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
addressesArray.forEach(addAddress);

/* -------------------------------------------------------------------------- */
/*                                Insert Products                             */
/* -------------------------------------------------------------------------- */
const addProduct = db.transaction((product) => {
  // Get or create Manufacturer ID
  let manufacturerId = db
    .prepare(`SELECT Manufacturer_ID FROM Manufacturers WHERE Name = ?;`)
    .get(product.manufacturer) as { Manufacturer_ID: number } | undefined;

  if (!manufacturerId) {
    manufacturerId = db
      .prepare(
        `INSERT INTO Manufacturers (Name) VALUES (?) RETURNING Manufacturer_ID;`
      )
      .get(product.manufacturer) as { Manufacturer_ID: number } | undefined;
  }

  // Get or create Category ID
  let categoryId = db
    .prepare(`SELECT Category_ID FROM Categories WHERE Name = ?;`)
    .get(product.category) as { Category_ID: number } | undefined;

  if (!categoryId) {
    categoryId = db
      .prepare(
        `INSERT INTO Categories (Name) VALUES (?) RETURNING Category_ID;`
      )
      .get(product.category) as { Category_ID: number } | undefined;
  }

  // Insert Product
  const productRow = db
    .prepare(
      `INSERT INTO Products (Name, Description, Price, Stock) VALUES (?, ?, ?, ?) RETURNING Product_ID;`
    )
    .get(product.name, product.description, product.price, product.stock) as
    | { Product_ID: number }
    | undefined;

  if (productRow?.Product_ID) {
    if (categoryId?.Category_ID) {
      insertData(
        `INSERT INTO ProductCategories (Product_ID, Category_ID) VALUES (?, ?);`,
        [productRow.Product_ID, categoryId.Category_ID],
        `Linked Product ${productRow.Product_ID} to Category ${categoryId.Category_ID}`
      );
    }
    if (manufacturerId?.Manufacturer_ID) {
      insertData(
        `INSERT INTO ProductManufacturers (Product_ID, Manufacturer_ID) VALUES (?, ?);`,
        [productRow.Product_ID, manufacturerId.Manufacturer_ID],
        `Linked Product ${productRow.Product_ID} to Manufacturer ${manufacturerId.Manufacturer_ID}`
      );
    }
  }
});
productsArray.forEach(addProduct);

/* -------------------------------------------------------------------------- */
/*                                Insert Orders                               */
/* -------------------------------------------------------------------------- */
const addOrder = db.transaction((order) => {
  const result = db
    .prepare(
      `INSERT INTO Orders (Customer_ID, Address_ID, OrderDate, TotalAmount, Status) 
     VALUES (?, ?, ?, ?, ?) RETURNING Order_ID;`
    )
    .get(
      order.Customer_ID,
      order.Address_ID,
      order.OrderDate,
      order.TotalAmount,
      order.Status
    ) as { Order_ID: number } | undefined;

  if (result) {
    console.log(
      `Added Order: ${result.Order_ID} for Customer ${order.Customer_ID}`
    );
  }
});
ordersArray.forEach(addOrder);

/* -------------------------------------------------------------------------- */
/*                             Insert Order Details                           */
/* -------------------------------------------------------------------------- */
const addOrderDetail = db.transaction((orderDetail) => {
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
orderDetailsArray.forEach(addOrderDetail);

/* -------------------------------------------------------------------------- */
/*                                Insert Reviews                              */
/* -------------------------------------------------------------------------- */
const addReview = db.transaction((review) => {
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
reviewsArray.forEach(addReview);
