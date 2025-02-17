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

// Get all orders for a specific customer
router.get("/:id/orders", getCustomerOrders);

// Get customer details
router.get("/:id", getCustomerById);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

// Update customer contact details and address
router.put("/:id", updateCustomer);

export default router;
