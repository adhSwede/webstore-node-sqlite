import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "webshop.db");

// Enable query logging only in development
const isDev = process.env.NODE_ENV !== "production";

export const db = new Database(dbPath, isDev ? { verbose: console.log } : {});

db.pragma("foreign_keys = ON");
