import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

interface CustomerOrder {
  Customer_ID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Street: string | null;
  City: string | null;
  State: string | null;
  ZipCode: string | null;
  Order_ID: number | null;
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

// Get customer details, including address and order history
const getCustomerById: RequestHandler = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid customer ID." });
  }

  const stmt = db.prepare(`
    SELECT 
      c.Customer_ID,
      c.FirstName,
      c.LastName,
      c.Email,
      c.Phone,
      a.Street,
      a.City,
      a.State,
      a.ZipCode,
      o.Order_ID
    FROM Customers c
    LEFT JOIN Addresses a ON c.Customer_ID = a.Customer_ID
    LEFT JOIN Orders o ON c.Customer_ID = o.Customer_ID
    WHERE c.Customer_ID = ?;
  `);

  const results = stmt.all(id) as CustomerOrder[];

  if (results.length === 0) {
    return res.status(404).json({ error: "Customer not found." });
  }

  const {
    Customer_ID,
    FirstName,
    LastName,
    Email,
    Phone,
    Street,
    City,
    State,
    ZipCode,
  } = results[0];

  const orders = results
    .map((row) => row.Order_ID)
    .filter((order): order is number => order !== null);

  res.json({
    Customer_ID,
    FirstName,
    LastName,
    Email,
    Phone,
    Address: {
      Street,
      City,
      State,
      ZipCode,
    },
    Orders: orders ?? [],
  });
});

// Get all orders for a specific customer
const getCustomerOrders: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid customer ID." });
    }

    const stmt = db.prepare(`
    SELECT 
      o.Order_ID,
      o.OrderDate,
      o.TotalAmount,
      o.Status
    FROM Orders o
    WHERE o.Customer_ID = ?;
  `);

    const orders = stmt.all(id) as {
      Order_ID: number;
      OrderDate: string;
      TotalAmount: number;
      Status: string;
    }[];

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ error: "No orders found for this customer." });
    }

    res.json({ Orders: orders });
  }
);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

// Update customer contact details and address
const updateCustomer: RequestHandler = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid customer ID." });
  }

  const { Email, Phone, Street, City, State, ZipCode } = req.body;

  if (!Email && !Phone && !Street && !City && !State && !ZipCode) {
    return res
      .status(400)
      .json({ error: "No valid fields provided for update." });
  }

  const parsedEmail = Email ?? null;
  const parsedPhone = Phone ?? null;
  const parsedStreet = Street ?? null;
  const parsedCity = City ?? null;
  const parsedState = State ?? null;
  const parsedZipCode = ZipCode ?? null;

  console.log("Received update request:", req.body);

  if (parsedEmail || parsedPhone) {
    const result = db
      .prepare(
        `UPDATE Customers 
         SET Email = COALESCE(?, Email), 
             Phone = COALESCE(?, Phone) 
         WHERE Customer_ID = ?;`
      )
      .run(parsedEmail, parsedPhone, id);
    console.log("Customer update result:", result);
  }

  const addressExists = db
    .prepare(`SELECT * FROM Addresses WHERE Customer_ID = ?`)
    .get(id) as { Customer_ID: number } | undefined;

  console.log("Address exists?", addressExists);

  if (parsedStreet || parsedCity || parsedState || parsedZipCode) {
    if (addressExists) {
      const result = db
        .prepare(
          `UPDATE Addresses 
           SET Street = COALESCE(?, Street), 
               City = COALESCE(?, City), 
               State = COALESCE(?, State), 
               ZipCode = COALESCE(?, ZipCode) 
           WHERE Customer_ID = ?;`
        )
        .run(parsedStreet, parsedCity, parsedState, parsedZipCode, id);

      console.log("Address update result:", result);
    } else {
      const result = db
        .prepare(
          `INSERT INTO Addresses (Customer_ID, Street, City, State, ZipCode) 
           VALUES (?, ?, ?, ?, ?);`
        )
        .run(id, parsedStreet, parsedCity, parsedState, parsedZipCode);

      console.log("New address insert result:", result);
    }
  }

  res.json({ message: "Customer updated successfully." });
});

export { getCustomerById, getCustomerOrders, updateCustomer };
