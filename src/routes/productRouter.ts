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
  getProductStats,
} from "../controllers/productsController";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
router.get("/category/:catid", getCategoryById);

router.get("/search", getProductsByName);

router.get("/", getProducts);

router.get("/:id", getProductById); // (must be after /search to prevent conflicts)

router.get("/stats", getProductStats);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
router.post("/", postProduct);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */
router.put("/:id", updateProduct);

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */
router.delete("/:id", deleteProduct);

export default router;
