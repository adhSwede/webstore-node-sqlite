import express from "express";
const router = express.Router();

import { getReviewStats } from "../controllers/reviewsController";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

// Get average rating per product
router.get("/stats", getReviewStats);

export default router;
