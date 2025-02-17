import express from "express";
const router = express.Router();

import { getReviewStats } from "../controllers/reviewsController";

router.get("/", getReviewStats);

export default router;
