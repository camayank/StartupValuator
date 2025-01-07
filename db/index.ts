import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@db/schema";

// Initialize connection pool with proper configuration
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || "5432"),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  ssl: process.env.NODE_ENV === "production",
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Health check function
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const client = await pool.connect();

    try {
      await client.query("SELECT NOW()");
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

// Set up error handling for the pool
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
  process.exit(-1);
});

// Handle process termination
process.once("SIGTERM", cleanup);
process.once("SIGINT", cleanup);
process.once("SIGUSR2", cleanup); // For nodemon restart