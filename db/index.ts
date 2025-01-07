import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a postgres connection with production-ready configuration
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
  ssl: true,
});

// Create drizzle database instance with schema
export const db = drizzle(queryClient, { schema });

// Health check function with proper error handling
export async function checkDatabaseHealth() {
  try {
    await queryClient`SELECT 1;`;
    return true;
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