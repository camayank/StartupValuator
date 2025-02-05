import { pgTable, serial, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { users } from "../types/user";

export const errorLogs = pgTable('error_logs', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  stack: text('stack'),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  category: text('category', { enum: ['validation', 'system', 'calculation', 'database', 'api'] }).notNull(),
  source: text('source').notNull(),
  context: jsonb('context').default({}),
  userId: serial('user_id').references(() => users.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  resolved: boolean('resolved').default(false),
  recoveryAttempted: boolean('recovery_attempted').default(false),
  recovered: boolean('recovered').default(false),
  alertTriggered: boolean('alert_triggered').default(false),
  alertDetails: jsonb('alert_details'),
  recoveryDetails: jsonb('recovery_details')
});

export type InsertErrorLog = typeof errorLogs.$inferInsert;
export type SelectErrorLog = typeof errorLogs.$inferSelect;