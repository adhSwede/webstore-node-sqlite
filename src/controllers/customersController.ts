import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

interface CustomerOrder {
  Customer_ID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Street: string | null; // Address fields (nullable in case there's no address)
  City: string | null;
  State: string | null;
  ZipCode: string | null;
  Order_ID: number | null;
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
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
    WHERE c.Customer_ID = ?
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
    WHERE o.Customer_ID = ?
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

  if (Email || Phone) {
    db.prepare(
      `UPDATE Customers 
       SET Email = COALESCE(?, Email), 
           Phone = COALESCE(?, Phone) 
       WHERE Customer_ID = ?;`
    ).run(Email, Phone, id);
  }

  const addressExists = db
    .prepare(`SELECT * FROM Addresses WHERE Customer_ID = ?`)
    .get(id) as { Customer_ID: number } | undefined;

  if (Street || City || State || ZipCode) {
    if (addressExists) {
      db.prepare(
        `UPDATE Addresses 
         SET Street = COALESCE(?, Street), 
             City = COALESCE(?, City), 
             State = COALESCE(?, State), 
             ZipCode = COALESCE(?, ZipCode) 
         WHERE Customer_ID = ?;`
      ).run(Street, City, State, ZipCode, id);
    } else {
      db.prepare(
        `INSERT INTO Addresses (Customer_ID, Street, City, State, ZipCode) 
         VALUES (?, ?, ?, ?, ?);`
      ).run(id, Street, City, State, ZipCode);
    }
  }

  res.json({ message: "Customer updated successfully." });
});

export { getCustomerById, getCustomerOrders, updateCustomer };
