import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a neon connection
const sql = neon(process.env.DATABASE_URL);

// Create drizzle database instance
export const db = drizzle(sql, { schema });

// Test the connection
sql.connect().catch(e => {
  console.error("Failed to connect to database:", e);
  process.exit(1);
});