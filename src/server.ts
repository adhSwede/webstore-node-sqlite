import express from "express";
import products from "./routes/products";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;
const app = express();

// Body parser MW
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/products", products);

app.listen(PORT, () => {
  console.log(`Server is running at ${baseURL}`);
});
