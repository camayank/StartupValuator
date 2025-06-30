import { Router } from 'express';
import { db } from '@db';
import { valuationDrafts } from '@db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const router = Router();

const draftSchema = z.object({
  sessionId: z.string().optional(),
  formData: z.record(z.any()),
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
    data: z.any(),
    errors: z.record(z.string()).optional()
  })),
  currentStep: z.number()
});

// Save or update draft
router.post('/', async (req, res) => {
  try {
    const validatedData = draftSchema.parse(req.body);
    const userId = req.user?.id || 1; // Default user for now
    
    let sessionId = validatedData.sessionId;
    
    if (sessionId) {
      // Update existing draft
      const [updated] = await db
        .update(valuationDrafts)
        .set({
          formData: validatedData.formData,
          steps: validatedData.steps,
          currentStep: validatedData.currentStep,
          updatedAt: new Date()
        })
        .where(eq(valuationDrafts.sessionId, sessionId))
        .returning();
        
      if (!updated) {
        return res.status(404).json({ message: 'Draft not found' });
      }
      
      res.json({ sessionId: updated.sessionId });
    } else {
      // Create new draft
      sessionId = nanoid();
      
      const [created] = await db
        .insert(valuationDrafts)
        .values({
          sessionId,
          userId,
          formData: validatedData.formData,
          steps: validatedData.steps,
          currentStep: validatedData.currentStep,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
        
      res.json({ sessionId: created.sessionId });
    }
  } catch (error) {
    console.error('Draft save failed:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid draft data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to save draft'
    });
  }
});

// Load draft by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const draft = await db.query.valuationDrafts.findFirst({
      where: eq(valuationDrafts.sessionId, sessionId)
    });
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    res.json({
      sessionId: draft.sessionId,
      formData: draft.formData,
      steps: draft.steps,
      currentStep: draft.currentStep,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt
    });
  } catch (error) {
    console.error('Draft load failed:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to load draft'
    });
  }
});

// Delete draft
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const [deleted] = await db
      .delete(valuationDrafts)
      .where(eq(valuationDrafts.sessionId, sessionId))
      .returning();
      
    if (!deleted) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Draft deletion failed:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to delete draft'
    });
  }
});

export default router;