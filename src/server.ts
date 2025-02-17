import express from "express";

import products from "./routes/productRouter";
import customers from "./routes/customerRouter";
import reviews from "./routes/reviewsRouter";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;
const app = express();

// Body parser MW
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/products", products);
app.use("/api/customers", customers);
app.use("/api/reviews", reviews);

app.listen(PORT, () => {
  console.log(`Server is running at ${baseURL}`);
});
