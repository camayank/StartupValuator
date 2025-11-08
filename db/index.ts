import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from "@db/schema";

let db: any;

// Allow running without database for development/demo
if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL not set. Running in demo mode without database persistence.",
  );
  console.warn(
    "⚠️  To enable full functionality, set DATABASE_URL to a Neon PostgreSQL connection string.",
  );
  console.warn(
    "⚠️  Get a free database at: https://neon.tech",
  );

  // Create a mock db object for demo mode
  db = null;
} else {
  // Enable connection pooling
  neonConfig.fetchConnectionCache = true;

  // Create SQL connection
  const sql = neon(process.env.DATABASE_URL!);

  // Create Drizzle instance
  db = drizzle(sql, {
    schema,
    logger: true
  });
}

export { db };
