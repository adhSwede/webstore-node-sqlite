import express from "express";
const router = express.Router();
import { getProducts, getProductById } from "../controllers/productsController";

// GET
// get all posts
router.get("/", getProducts);

// get single post
router.get("/:id", getProductById);

export default router;

// // POST
// // create new post
// router.post("/", createPost);

// // PUT
// // update post
// router.put("/:id", updatePost);

// // DELETE
// // delete post
// router.delete("/:id", deletePost);
