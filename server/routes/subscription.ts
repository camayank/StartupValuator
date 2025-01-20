import { Router } from 'express';
import { db } from '@db';
import { subscriptionPlans, userSubscriptions, users } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import type { InsertUserSubscription } from '@db/schema';

const router = Router();

// Get available subscription plans
router.get('/api/subscription/plans', async (_req, res) => {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));

    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's current subscription
router.get('/api/subscription/current', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, req.user!.id),
      with: {
        plan: true
      }
    });

    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Subscribe to a plan
router.post('/api/subscription/subscribe', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { planId } = req.body;

    // Check if plan exists and is active
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found or inactive' });
    }

    // Cancel existing subscription if any
    await db
      .update(userSubscriptions)
      .set({ 
        status: 'cancelled',
        canceledAt: new Date()
      })
      .where(
        and(
          eq(userSubscriptions.userId, req.user!.id),
          eq(userSubscriptions.status, 'active')
        )
      );

    // Create new subscription
    const subscription: InsertUserSubscription = {
      userId: req.user!.id,
      planId: plan.id,
      status: 'active',
      startDate: new Date(),
      usageStats: {
        reportsGenerated: 0,
        apiCalls: 0,
        lastReportDate: new Date().toISOString()
      }
    };

    const [newSubscription] = await db
      .insert(userSubscriptions)
      .values(subscription)
      .returning();

    // Update user's subscription tier
    await db
      .update(users)
      .set({ subscriptionTier: plan.tier })
      .where(eq(users.id, req.user!.id));

    res.json(newSubscription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize subscription plans
router.post('/api/subscription/init-plans', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Insert default plans
    const plans = [
      {
        name: 'Free',
        tier: 'free' as const,
        price: 0,
        billingPeriod: 'monthly',
        features: {
          valuationReports: 1,
          aiAnalysis: false,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false,
          teamMembers: 1,
          advancedAnalytics: false,
        },
        isActive: true
      },
      {
        name: 'Pro',
        tier: 'premium' as const,
        price: 4900, // $49.00
        billingPeriod: 'monthly',
        features: {
          valuationReports: -1, // unlimited
          aiAnalysis: true,
          customBranding: true,
          apiAccess: true,
          prioritySupport: false,
          teamMembers: 1,
          advancedAnalytics: true,
        },
        isActive: true
      },
      {
        name: 'Enterprise',
        tier: 'enterprise' as const,
        price: 0, // custom pricing
        billingPeriod: 'monthly',
        features: {
          valuationReports: -1,
          aiAnalysis: true,
          customBranding: true,
          apiAccess: true,
          prioritySupport: true,
          teamMembers: -1,
          advancedAnalytics: true,
        },
        isActive: true
      }
    ];

    await db.insert(subscriptionPlans).values(plans);

    res.json({ message: 'Subscription plans initialized' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;