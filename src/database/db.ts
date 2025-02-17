import Database from "better-sqlite3";
import path from "path";

// Resolve the database file path
const dbPath = path.resolve(__dirname, "webshop.db");

// Initialize the SQLite database connection
export const db = new Database(dbPath, { verbose: console.log });

// Enable foreign key constraints
db.pragma("foreign_keys = ON");
