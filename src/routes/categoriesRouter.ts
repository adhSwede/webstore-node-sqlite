import express from "express";
import {
  getCategoryById,
  getCategoryStats,
  updateCategory,
} from "../controllers/categoriesController";

const router = express.Router({ mergeParams: true });

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
router.get("/stats", getCategoryStats); // Get category statistics
router.get("/:id", getCategoryById); // Get category details by ID

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */
router.put("/:id", updateCategory); // Update category (CASCADE UPDATE enabled)

export default router;
