import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@db/schema";

// Ensure all required environment variables are present
const requiredEnvVars = ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'PGPORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is required`);
  }
}

// Initialize connection pool
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432'),
  ssl: true,
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Health check function
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    const duration = Date.now() - startTime;
    console.log(`Database health check successful (${duration}ms)`);
    return true;
  } catch (error: any) {
    console.error("Database health check failed:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    return false;
  }
}

// Cleanup function
export async function cleanup() {
  try {
    console.log("Initiating database connection cleanup...");
    await pool.end();
    console.log("Database connections closed successfully");
  } catch (error: any) {
    console.error("Error during database cleanup:", {
      message: error.message,
      code: error.code,
    });
  }
}

// Graceful shutdown handlers
process.once('SIGTERM', cleanup);
process.once('SIGINT', cleanup);
process.once('SIGUSR2', cleanup); // For nodemon restart