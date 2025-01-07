import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a postgres connection with optimized settings for high load
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 20, // Maximum number of connections in pool
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 10, // Try to connect for 10 seconds
  max_lifetime: 60 * 30, // Connection lifetime of 30 minutes
  ssl: true,
});

// Create drizzle database instance with schema
export const db = drizzle(queryClient, { schema });

// Health check function
export async function checkDatabaseHealth() {
  try {
    // Simple query to test connection
    const [{ result }] = await queryClient`SELECT 1 AS result`;
    return result === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Cleanup function for graceful shutdown
export async function cleanup() {
  try {
    await queryClient.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Add event listeners for process termination
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);