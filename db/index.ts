import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Health check function with proper error handling
export async function checkDatabaseHealth() {
  try {
    await sql`SELECT 1;`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Cleanup function for graceful shutdown
export async function cleanup() {
  try {
    // No need to close connection as neon handles this automatically
    console.log('Database connections cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Add event listeners for process termination
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);