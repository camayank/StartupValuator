import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create postgres connection with the correct SSL config for Replit
const client = postgres(process.env.DATABASE_URL, {
  max: 1, // Use a single connection since we're in a serverless environment
  ssl: {
    rejectUnauthorized: false // Required for Replit's PostgreSQL
  }
});

// Create drizzle database instance
export const db = drizzle(client, { schema });