import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "webshop.db");
const isDev = process.env.NODE_ENV === "development";

// Initialize database with verbose logging in development
export const db = new Database(dbPath, isDev ? { verbose: console.debug } : {});

// Enforce foreign key constraints
db.pragma("foreign_keys = ON");

// Optional: Prevent accidental database writes in production
if (!isDev) db.pragma("journal_mode = WAL");
