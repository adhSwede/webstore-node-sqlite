import express from "express";

import products from "./routes/productsRouter";
import customers from "./routes/customersRouter";
import reviews from "./routes/reviewsRouter";
import categories from "./routes/categoriesRouter";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;
const app = express();

/* -------------------------------------------------------------------------- */
/*                                Middleware                                  */
/* -------------------------------------------------------------------------- */

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

/* -------------------------------------------------------------------------- */
/*                                  Routes                                    */
/* -------------------------------------------------------------------------- */

// Product-related routes
app.use("/api/products", products);

// Customer-related routes
app.use("/api/customers", customers);

// Review-related routes
app.use("/api/reviews", reviews);

// Category-related routes
app.use("/api/categories", categories);

/* -------------------------------------------------------------------------- */
/*                                  Server                                    */
/* -------------------------------------------------------------------------- */

app.listen(PORT, () => {
  console.log(`Server is running at ${baseURL}`);
});
