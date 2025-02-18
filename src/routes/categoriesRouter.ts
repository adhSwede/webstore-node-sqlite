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

router.get("/stats", getCategoryStats); // Category-based product stats
router.get("/:id", getCategoryById); // Get category details

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

router.put("/:id", updateCategory); // Update category (CASCADE UPDATE enabled)

export default router;
