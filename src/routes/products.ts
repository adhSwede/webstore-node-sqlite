import express from "express";
const router = express.Router();

import {
  getProducts,
  getProductById,
  getProductsByName,
  getCategoryById,
  postProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
// GET products by category ID
router.get("/category/:catid", getCategoryById);

// GET (query param ?name=macbook)
router.get("/search", getProductsByName);

// GET all products
router.get("/", getProducts);

// GET single product by ID (must be after /search to prevent conflicts)
router.get("/:id", getProductById);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
// POST new product
router.post("/", postProduct);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */
// PUT (Edit) existing product
router.put("/:id", updateProduct);

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */
// DELETE product
router.delete("/:id", deleteProduct);

export default router;
