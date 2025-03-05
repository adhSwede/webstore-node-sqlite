import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "webshop.db");
const isDev = process.env.NODE_ENV === "development";

// Logging in dev
export const db = new Database(dbPath, isDev ? { verbose: console.debug } : {});

// Foreign key constraint ON
db.pragma("foreign_keys = ON");

// Prevent bad database writes in prod
if (!isDev) db.pragma("journal_mode = WAL");
