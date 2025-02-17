import express from "express";
const router = express.Router();

import {
  getProducts,
  getProductById,
  getProductsByName,
  postProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

// Search should be above `/:id` to prevent conflicts
router.get("/search", getProductsByName);

// Get all products (must be before `/:id`)
router.get("/", getProducts);

// Get product by ID (should always be last among GET routes)
router.get("/:id", getProductById);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

// Add a new product
router.post("/", postProduct);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

// Update a specific product by ID
router.put("/:id", updateProduct);

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */

// Delete a specific product by ID
router.delete("/:id", deleteProduct);

export default router;
