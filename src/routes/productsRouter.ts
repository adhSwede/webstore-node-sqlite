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

router.get("/", getProducts); // Supports filtering via query parameters
router.get("/search", getProductsByName); // Search route must come before `/:id`
router.get("/:id", getProductById); // Get product by ID

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

router.post("/", postProduct); // Add a new product

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

router.put("/:id", updateProduct); // Update product by ID

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */

router.delete("/:id", deleteProduct); // Delete product by ID

export default router;
