import express from "express";
const router = express.Router();

import {
  getCategoryById,
  getCategoryStats,
  updateCategory,
} from "../controllers/categoriesController";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

// Get category-based product statistics
router.get("/stats", getCategoryStats);

// Get category details
router.get("/:id", getCategoryById);

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

// Update category name or ID (triggers CASCADE UPDATE)
router.put("/:id", updateCategory);

export default router;
