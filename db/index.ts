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

// Health check function
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const result = await sql`SELECT NOW()`;
    const duration = Date.now() - startTime;
    console.log(`Database health check successful (${duration}ms)`);
    return true;
  } catch (error: any) {
    console.error("Database health check failed:", {
      message: error.message,
      code: error.code,
    });
    return false;
  }
}

// No explicit cleanup needed for neon-serverless
export async function cleanup() {
  console.log("Database connections managed automatically by neon-serverless");
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