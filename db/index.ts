import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// Health check function
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      const duration = Date.now() - startTime;
      console.log(`Database health check successful (${duration}ms)`);
      return true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Database health check failed:", {
      message: error.message,
      code: error.code,
    });
    return false;
  }
}

// Cleanup function
export async function cleanup() {
  console.log("Initiating database connection cleanup...");
  try {
    await pool.end();
    console.log("Database connections closed successfully");
  } catch (error: any) {
    console.error("Error during database cleanup:", {
      message: error.message,
      code: error.code,
    });
    throw error;
  }
}

// Handle process termination
process.once("SIGTERM", cleanup);
process.once("SIGINT", cleanup);
process.once("SIGUSR2", cleanup); // For nodemon restart

// Initial connection test
checkDatabaseHealth().catch(err => {
  console.error("Unexpected error on database client", err);
  process.exit(-1);
});