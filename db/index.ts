import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
});

// Export a function to test the connection
export async function testConnection() {
  try {
    const result = await db.execute("SELECT 1"); //Use db object for the query
    return result != null;
  } catch (error) {
    console.error("Database connection test failed:", error);
    throw error;
  }
}