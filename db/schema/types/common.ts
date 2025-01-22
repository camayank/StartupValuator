import { pgEnum } from "drizzle-orm/pg-core";

// Core enums
export const userRoles = pgEnum("user_role", ["startup", "investor", "valuer", "consultant"]);
export const subscriptionTiers = pgEnum("subscription_tier", ["free", "basic", "premium", "enterprise"]);
export const planStatus = pgEnum("plan_status", ["active", "cancelled", "past_due", "trial"]);

// Activity and workflow enums
export const activityTypes = pgEnum("activity_type", [
  "page_view", "valuation_started", "valuation_completed", "projection_created",
  "pitch_deck_generated", "compliance_check", "dashboard_view", "profile_update",
  "settings_change", "feature_interaction"
]);

// Business and valuation enums
export const productStageEnum = pgEnum("product_stage", ["concept", "mvp", "beta", "production"]);
export const businessModelEnum = pgEnum("business_model", [
  "subscription", "transactional", "marketplace", "advertising", "licensing",
  "saas", "platform", "hardware", "services", "hybrid"
]);
export const sectorEnum = pgEnum("sector", [
  "enterprise", "technology", "healthtech", "fintech", "ecommerce", "deeptech",
  "cleantech", "consumer_digital", "industrial_tech", "agritech", "proptech", "mobility"
]);

// Market analysis enums
export const marketSizeTypes = pgEnum("market_size_type", ["tam", "sam", "som"]);
export const riskLevels = pgEnum("risk_level", ["low", "medium", "high", "critical"]);

// Report enums
export const reportTypes = pgEnum("report_type", ["summary", "detailed", "comprehensive"]);
export const reportFormat = pgEnum("report_format", ["pdf", "excel", "both"]);
