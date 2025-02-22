import express from "express";
import {
  getProducts,
  getProductById,
  getProductsByName,
  postProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController";

const router = express.Router({ mergeParams: true });

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
router.get("/", getProducts); // Fetch all products (supports filtering)
router.get("/search", getProductsByName); // Search products by name (must be before `/:id`)
router.get("/:id", getProductById); // Get a product by ID

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
router.post("/", postProduct); // Create a new product

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */
router.put("/:id", updateProduct); // Update product by ID

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */
router.delete("/:id", deleteProduct); // Delete product by ID

export default router;
