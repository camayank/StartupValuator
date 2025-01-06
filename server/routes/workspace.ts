import { Router } from "express";
import { db } from "@db";
import { workspaces, workspaceMembers, valuations, valuationComments, auditTrail } from "@db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Middleware to check workspace access
async function checkWorkspaceAccess(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).send("Not authenticated");
  }

  const workspaceId = parseInt(req.params.workspaceId);
  if (isNaN(workspaceId)) {
    return res.status(400).send("Invalid workspace ID");
  }

  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, req.user.id)
      )
    )
    .limit(1);

  if (!member) {
    return res.status(403).send("Access denied");
  }

  req.workspaceMember = member;
  next();
}

// Create workspace
router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).send("Not authenticated");
  }

  const { name, settings } = req.body;

  try {
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name,
        ownerId: req.user.id,
        settings: settings || {
          defaultCurrency: "USD",
          complianceFramework: "ivs",
          region: "global"
        },
      })
      .returning();

    // Add owner as a member
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: req.user.id,
      role: "owner",
      invitedBy: req.user.id,
    });

    // Add audit log
    await db.insert(auditTrail).values({
      workspaceId: workspace.id,
      userId: req.user.id,
      action: "valuation_created",
      details: { name, settings },
    });

    res.json(workspace);
  } catch (error) {
    res.status(500).send("Failed to create workspace");
  }
});

// Get user's workspaces
router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const userWorkspaces = await db
      .select()
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, req.user.id));

    res.json(userWorkspaces);
  } catch (error) {
    res.status(500).send("Failed to fetch workspaces");
  }
});

// Invite member to workspace
router.post("/:workspaceId/members", checkWorkspaceAccess, async (req, res) => {
  const { email, role } = req.body;
  const workspaceId = parseInt(req.params.workspaceId);

  // Check if inviter has admin/owner role
  if (!["owner", "admin"].includes(req.workspaceMember.role)) {
    return res.status(403).send("Only owners and admins can invite members");
  }

  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.email, email))
      .limit(1);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Add member
    const [member] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId: user.id,
        role,
        invitedBy: req.user.id,
      })
      .returning();

    // Add audit log
    await db.insert(auditTrail).values({
      workspaceId,
      userId: req.user.id,
      action: "member_invited",
      details: { memberId: member.id, role },
    });

    res.json(member);
  } catch (error) {
    res.status(500).send("Failed to invite member");
  }
});

// Add comment to valuation
router.post("/:workspaceId/valuations/:valuationId/comments", checkWorkspaceAccess, async (req, res) => {
  const { comment, context } = req.body;
  const valuationId = parseInt(req.params.valuationId);
  const workspaceId = parseInt(req.params.workspaceId);

  try {
    // Verify valuation exists and belongs to workspace
    const [valuation] = await db
      .select()
      .from(valuations)
      .where(
        and(
          eq(valuations.id, valuationId),
          eq(valuations.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!valuation) {
      return res.status(404).send("Valuation not found");
    }

    // Add comment
    const [newComment] = await db
      .insert(valuationComments)
      .values({
        valuationId,
        userId: req.user.id,
        comment,
        context,
      })
      .returning();

    // Add audit log
    await db.insert(auditTrail).values({
      workspaceId,
      userId: req.user.id,
      action: "comment_added",
      details: { valuationId, commentId: newComment.id },
      valuationId,
    });

    res.json(newComment);
  } catch (error) {
    res.status(500).send("Failed to add comment");
  }
});

// Get valuation comments
router.get("/:workspaceId/valuations/:valuationId/comments", checkWorkspaceAccess, async (req, res) => {
  const valuationId = parseInt(req.params.valuationId);
  const workspaceId = parseInt(req.params.workspaceId);

  try {
    const comments = await db
      .select()
      .from(valuationComments)
      .innerJoin(valuations, eq(valuations.id, valuationComments.valuationId))
      .where(
        and(
          eq(valuationComments.valuationId, valuationId),
          eq(valuations.workspaceId, workspaceId)
        )
      )
      .orderBy(valuationComments.createdAt);

    res.json(comments);
  } catch (error) {
    res.status(500).send("Failed to fetch comments");
  }
});

export default router;
