import express from "express";
const router = express.Router();

import { getReviewStats } from "../controllers/reviewsController";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

router.get("/stats", getReviewStats); // Get average rating per product

export default router;
