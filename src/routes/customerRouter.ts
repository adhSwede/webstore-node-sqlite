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
router.get("/:id", getCustomerById);

router.get("/:id/orders", getCustomerOrders);

router.put("/:id", updateCustomer);

export default router;
