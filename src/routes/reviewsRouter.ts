import express from "express";
import { getReviewStats } from "../controllers/reviewsController";

const router = express.Router({ mergeParams: true });

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */
router.get("/stats", getReviewStats); // Retrieve average rating per product

export default router;
