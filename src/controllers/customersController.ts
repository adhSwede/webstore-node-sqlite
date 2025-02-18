import { RequestHandler } from "express";
import { db } from "../database/db";
import asyncHandler from "../middleware/asyncHandler";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

const getCustomerById: RequestHandler = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id))
    throw Object.assign(new Error("Invalid customer ID."), { status: 400 });

  const stmt = db.prepare(`
    SELECT c.*, a.Street, a.City, a.State, a.ZipCode
    FROM Customers c
    LEFT JOIN Addresses a ON c.Customer_ID = a.Customer_ID
    WHERE c.Customer_ID = ?;
  `);

  const customer = stmt.get(id);
  if (!customer)
    throw Object.assign(new Error("Customer not found."), { status: 404 }); // If no row, customer doesn't exist

  res.json(customer);
});

const getCustomerOrders: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      throw Object.assign(new Error("Invalid customer ID."), { status: 400 });

    const stmt = db.prepare(`
    SELECT o.Order_ID, o.OrderDate, o.TotalAmount, o.Status
    FROM Orders o
    WHERE o.Customer_ID = ?;
  `);

    const orders = stmt.all(id);
    if (orders.length === 0)
      throw Object.assign(new Error("No orders found."), { status: 404 }); // No orders for this customer

    res.json({ Orders: orders });
  }
);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

const updateCustomer: RequestHandler = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id))
    throw Object.assign(new Error("Invalid customer ID."), { status: 400 });

  const { Email, Phone, Street, City, State, ZipCode } = req.body;
  if (!Email && !Phone && !Street && !City && !State && !ZipCode)
    throw Object.assign(new Error("No valid fields provided."), {
      status: 400,
    });

  // Update contact details if provided
  if (Email || Phone) {
    db.prepare(
      `
      UPDATE Customers 
      SET Email = COALESCE(?, Email), 
          Phone = COALESCE(?, Phone) 
      WHERE Customer_ID = ?;
    `
    ).run(Email, Phone, id);
  }

  const addressExists = db
    .prepare(`SELECT 1 FROM Addresses WHERE Customer_ID = ?`)
    .get(id); // Check if address exists

  // Update or insert address based on existence
  if (Street || City || State || ZipCode) {
    if (addressExists) {
      db.prepare(
        `
        UPDATE Addresses 
        SET Street = COALESCE(?, Street), 
            City = COALESCE(?, City), 
            State = COALESCE(?, State), 
            ZipCode = COALESCE(?, ZipCode) 
        WHERE Customer_ID = ?;
      `
      ).run(Street, City, State, ZipCode, id);
    } else {
      db.prepare(
        `
        INSERT INTO Addresses (Customer_ID, Street, City, State, ZipCode) 
        VALUES (?, ?, ?, ?, ?);
      `
      ).run(id, Street, City, State, ZipCode);
    }
  }

  res.json({ message: "Customer updated successfully." });
});

export { getCustomerById, getCustomerOrders, updateCustomer };
