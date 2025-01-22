import { relations } from "drizzle-orm";
import { users, userProfiles } from "../types/user";
import { valuationRecords } from "../types/valuation";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  valuations: many(valuationRecords),
}));

export const profileRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
