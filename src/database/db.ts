import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "webshop.db");
const isDev = process.env.NODE_ENV === "development";

// Enable logging in dev
export const db = new Database(dbPath, isDev ? { verbose: console.debug } : {});

// Foreign key constraints ON
db.pragma("foreign_keys = ON");

// Optional: Prevent acc database writes in prod
if (!isDev) db.pragma("journal_mode = WAL");
