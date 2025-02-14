import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "webshop.db");

export const db = new Database(dbPath, { verbose: console.log });

db.pragma("foreign_keys = ON");
