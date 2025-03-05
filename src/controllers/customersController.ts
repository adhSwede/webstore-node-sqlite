import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";
import { handleDBError } from "../utils/errorUtils";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getCustomerById: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  handleDBError(isNaN(id), "Invalid customer ID.", 400);

  const customer = db
    .prepare(
      `
    SELECT c.*, a.Street, a.City, a.State, a.ZipCode
    FROM Customers c
    LEFT JOIN Addresses a ON c.Customer_ID = a.Customer_ID
    WHERE c.Customer_ID = ?;
  `
    )
    .get(id);

  handleDBError(!customer, "Customer not found.", 404);
  res.json(customer);
});

const getCustomerOrders: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  handleDBError(isNaN(id), "Invalid customer ID.", 400);

  const orders = db
    .prepare(
      `
    SELECT Order_ID, OrderDate, TotalAmount, Status
    FROM Orders
    WHERE Customer_ID = ?;
  `
    )
    .all(id);

  handleDBError(orders.length === 0, "No orders found.", 404);
  res.json({ Orders: orders });
});

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

const updateCustomer: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { Email, Phone, Street, City, State, ZipCode } = req.body;

  handleDBError(isNaN(id), "Invalid customer ID.", 400);
  handleDBError(
    !Email && !Phone && !Street && !City && !State && !ZipCode,
    "No valid fields provided.",
    400
  );

  if (Email || Phone) {
    db.prepare(
      `
      UPDATE Customers 
      SET Email = COALESCE(?, Email), Phone = COALESCE(?, Phone) 
      WHERE Customer_ID = ?;
    `
    ).run(Email, Phone, id);
  }

  // Handle address update/insert
  if (Street || City || State || ZipCode) {
    const addressExists = db
      .prepare(`SELECT 1 FROM Addresses WHERE Customer_ID = ?`)
      .get(id);

    db.prepare(
      addressExists
        ? `UPDATE Addresses SET Street = COALESCE(?, Street), City = COALESCE(?, City), State = COALESCE(?, State), ZipCode = COALESCE(?, ZipCode) WHERE Customer_ID = ?;`
        : `INSERT INTO Addresses (Customer_ID, Street, City, State, ZipCode) VALUES (?, ?, ?, ?, ?);`
    ).run(
      addressExists
        ? [Street, City, State, ZipCode, id]
        : [id, Street, City, State, ZipCode]
    );
  }

  res.json({ message: "Customer updated successfully." });
});

export { getCustomerById, getCustomerOrders, updateCustomer };
