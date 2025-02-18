import express from "express";
const router = express.Router();

import {
  getCustomerById,
  getCustomerOrders,
  updateCustomer,
} from "../controllers/customersController";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

router.get("/:id/orders", getCustomerOrders); // Get all orders for a customer
router.get("/:id", getCustomerById); // Get customer details

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

router.put("/:id", updateCustomer); // Update contact details and address

export default router;
