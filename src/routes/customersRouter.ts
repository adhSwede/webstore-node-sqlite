import express from "express";
import {
  getCustomerById,
  getCustomerOrders,
  updateCustomer,
} from "../controllers/customersController";

const router = express.Router({ mergeParams: true });

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
router.get("/:id/orders", getCustomerOrders); // Fetch all orders for a customer
router.get("/:id", getCustomerById); // Retrieve customer details

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */
router.put("/:id", updateCustomer); // Update customer details & address

export default router;
