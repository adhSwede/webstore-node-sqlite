import express from "express";
import cors from "cors";

import products from "./routes/productsRouter";
import customers from "./routes/customersRouter";
import reviews from "./routes/reviewsRouter";
import categories from "./routes/categoriesRouter";

import errorHandler from "./middleware/errorHandler";
import logger from "./middleware/logger";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;
const app = express();

/* -------------------------------------------------------------------------- */
/*                                Middleware                                  */
/* -------------------------------------------------------------------------- */
app.use(cors()); // Enable CORS for API requests
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(logger); // Request logger

/* -------------------------------------------------------------------------- */
/*                                  Routes                                    */
/* -------------------------------------------------------------------------- */
app.use("/api/products", products);
app.use("/api/customers", customers);
app.use("/api/reviews", reviews);
app.use("/api/categories", categories);

/* -------------------------------------------------------------------------- */
/*                               Error Handling                               */
/* -------------------------------------------------------------------------- */
app.use(errorHandler);

/* -------------------------------------------------------------------------- */
/*                                  Server                                    */
/* -------------------------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`\nServer running at:\n→ ${baseURL}\n`);
});
