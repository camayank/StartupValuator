import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Initialize connection pool with proper configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Health check function with enhanced error reporting
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

// Enhanced cleanup function with timeout
export async function cleanup() {
  console.log("Initiating database connection cleanup...");

  try {
    const closeTimeout = setTimeout(() => {
      console.error("Database cleanup timeout exceeded");
      process.exit(1);
    }, 5000);

    await pool.end();
    clearTimeout(closeTimeout);

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