import { db } from "@db";
import {
  workflowSuggestions,
  type InsertWorkflowSuggestion,
} from "@db/schema";
import { ActivityTracker } from "./activityTracker";
import { eq, and, lte, gte, asc } from "drizzle-orm";

export class WorkflowSuggestionEngine {
  private static readonly SUGGESTION_PATTERNS = {
    new_user_onboarding: {
      pattern: ["page_view"],
      suggestion: {
        title: "Welcome to StartupValuator!",
        description: "Start by creating your first valuation report.",
        suggestedAction: "/valuation/new",
        priority: 1,
      },
    },
    incomplete_valuation: {
      pattern: ["valuation_started"],
      suggestion: {
        title: "Continue Your Valuation",
        description: "You have an unfinished valuation report. Complete it to get insights about your startup.",
        suggestedAction: "/valuation/continue",
        priority: 2,
      },
    },
    need_projections: {
      pattern: ["valuation_completed"],
      suggestion: {
        title: "Create Financial Projections",
        description: "Enhance your valuation with detailed financial projections.",
        suggestedAction: "/projections/new",
        priority: 3,
      },
    },
    compliance_check: {
      pattern: ["pitch_deck_generated", "projection_created"],
      suggestion: {
        title: "Verify Compliance",
        description: "Ensure your startup meets all regulatory requirements.",
        suggestedAction: "/compliance/check",
        priority: 4,
      },
    },
  };

  static async generateSuggestions(userId: number): Promise<InsertWorkflowSuggestion[]> {
    try {
      const activityPattern = await ActivityTracker.getRecentActivityPattern(userId);
      const suggestions: InsertWorkflowSuggestion[] = [];

      // Clean up expired suggestions
      await db
        .delete(workflowSuggestions)
        .where(
          and(
            eq(workflowSuggestions.userId, userId),
            lte(workflowSuggestions.expiresAt, new Date())
          )
        );

      // Generate new suggestions based on activity patterns
      for (const [key, data] of Object.entries(WorkflowSuggestionEngine.SUGGESTION_PATTERNS)) {
        if (this.matchesPattern(activityPattern, data.pattern)) {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24); // Suggestions expire after 24 hours

          suggestions.push({
            userId,
            title: data.suggestion.title,
            description: data.suggestion.description,
            suggestedAction: data.suggestion.suggestedAction,
            priority: data.suggestion.priority,
            based_on: {
              activityPattern: data.pattern,
              previousActions: activityPattern,
            },
            expiresAt,
          });
        }
      }

      // Insert new suggestions
      if (suggestions.length > 0) {
        await db.insert(workflowSuggestions).values(suggestions);
      }

      return suggestions;
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      return [];
    }
  }

  static async getUserSuggestions(userId: number) {
    try {
      const now = new Date();
      return await db
        .select()
        .from(workflowSuggestions)
        .where(
          and(
            eq(workflowSuggestions.userId, userId),
            eq(workflowSuggestions.shown, false),
            gte(workflowSuggestions.expiresAt, now)
          )
        )
        .orderBy(asc(workflowSuggestions.priority))
        .limit(3);
    } catch (error) {
      console.error("Failed to get user suggestions:", error);
      return [];
    }
  }

  private static matchesPattern(userActivities: string[], pattern: string[]): boolean {
    return pattern.every((activity) =>
      userActivities.includes(activity)
    );
  }

  static async markSuggestionAsShown(suggestionId: number) {
    try {
      await db
        .update(workflowSuggestions)
        .set({ shown: true })
        .where(eq(workflowSuggestions.id, suggestionId));
    } catch (error) {
      console.error("Failed to mark suggestion as shown:", error);
    }
  }

  static async markSuggestionAsClicked(suggestionId: number) {
    try {
      await db
        .update(workflowSuggestions)
        .set({ clicked: true })
        .where(eq(workflowSuggestions.id, suggestionId));
    } catch (error) {
      console.error("Failed to mark suggestion as clicked:", error);
    }
  }
}