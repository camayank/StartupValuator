import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a postgres connection with optimized settings for high load
const client = postgres(process.env.DATABASE_URL, {
  max: 20, // Maximum number of connections in pool
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 10, // Try to connect for 10 seconds
  max_lifetime: 60 * 30, // Connection lifetime of 30 minutes
  prepare: true, // Enable prepared statements
  ssl: { rejectUnauthorized: false }, // Accept self-signed certificates
  types: {
    bigint: postgres.BigInt,
  },
  connection: {
    application_name: 'startup_valuator',
    statement_timeout: 60000, // 1 minute statement timeout
    idle_in_transaction_session_timeout: 60000, // 1 minute idle transaction timeout
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
});

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Health check function
export async function checkDatabaseHealth() {
  try {
    const result = await client`SELECT 1`;
    return result.length === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Cleanup function for graceful shutdown
export async function cleanup() {
  try {
    await client.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Add event listeners for process termination
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);