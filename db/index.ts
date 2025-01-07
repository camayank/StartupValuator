import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@db/schema";

if (!process.env.PGDATABASE) {
  throw new Error(
    "Database environment variables are required. Did you forget to provision a database?",
  );
}

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    require: true,
    rejectUnauthorized: true
  }
});

export const db = drizzle(pool, { schema });

// Health check function
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW()');
    const duration = Date.now() - startTime;
    console.log(`Database health check successful (${duration}ms)`);
    return true;
  } catch (error: any) {
    console.error("Database health check failed:", {
      message: error.message,
      code: error.code,
      env: {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
      }
    });
    return false;
  }
}

// Handle cleanup
export async function cleanup() {
  await pool.end();
  console.log("Database connections cleaned up");
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