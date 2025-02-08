import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
import { z } from 'zod';
import { auditTrailService } from './audit-trail-service';
import type { ValuationFormData } from '../../client/src/lib/validations';

// Define collaboration event types
export const CollaborationEventType = {
  JOIN_SESSION: 'JOIN_SESSION',
  LEAVE_SESSION: 'LEAVE_SESSION',
  UPDATE_ASSUMPTION: 'UPDATE_ASSUMPTION',
  RESOLVE_CONFLICT: 'RESOLVE_CONFLICT',
  SYNC_STATE: 'SYNC_STATE',
} as const;

// Collaboration event schema
const collaborationEventSchema = z.object({
  type: z.enum([
    CollaborationEventType.JOIN_SESSION,
    CollaborationEventType.LEAVE_SESSION,
    CollaborationEventType.UPDATE_ASSUMPTION,
    CollaborationEventType.RESOLVE_CONFLICT,
    CollaborationEventType.SYNC_STATE,
  ]),
  sessionId: z.string(),
  userId: z.string(),
  payload: z.record(z.unknown()),
  timestamp: z.date(),
  version: z.number(),
});

type CollaborationEvent = z.infer<typeof collaborationEventSchema>;

interface CollaborationSession {
  id: string;
  users: Map<string, WebSocket>;
  state: ValuationFormData;
  version: number;
  lastModified: Date;
}

class CollaborationService {
  private sessions: Map<string, CollaborationSession>;
  private wss: WebSocketServer | null = null;

  constructor() {
    this.sessions = new Map();
  }

  initialize(server: ReturnType<typeof createServer>) {
    if (this.wss) {
      throw new Error('WebSocket server already initialized');
    }

    this.wss = new WebSocketServer({ server, path: '/ws/collab' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    if (!this.wss) {
      throw new Error('WebSocket server not initialized');
    }

    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', async (data: string) => {
        try {
          const event = JSON.parse(data) as CollaborationEvent;
          await this.handleCollaborationEvent(ws, event);
        } catch (error) {
          console.error('Collaboration event error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to process event'
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }

  private async handleCollaborationEvent(ws: WebSocket, event: CollaborationEvent) {
    const session = this.sessions.get(event.sessionId);

    switch (event.type) {
      case CollaborationEventType.JOIN_SESSION:
        await this.handleJoinSession(ws, event);
        break;
      case CollaborationEventType.UPDATE_ASSUMPTION:
        await this.handleUpdateAssumption(session, event);
        break;
      case CollaborationEventType.RESOLVE_CONFLICT:
        await this.handleConflictResolution(session, event);
        break;
      default:
        throw new Error(`Unsupported event type: ${event.type}`);
    }

    // Record event in audit trail
    await this.recordCollaborationEvent(event);
  }

  private async handleJoinSession(ws: WebSocket, event: CollaborationEvent) {
    let session = this.sessions.get(event.sessionId);

    if (!session) {
      session = {
        id: event.sessionId,
        users: new Map(),
        state: event.payload.initialState as ValuationFormData,
        version: 0,
        lastModified: new Date()
      };
      this.sessions.set(event.sessionId, session);
    }

    session.users.set(event.userId, ws);

    // Send current state to new user
    ws.send(JSON.stringify({
      type: CollaborationEventType.SYNC_STATE,
      sessionId: event.sessionId,
      payload: {
        state: session.state,
        version: session.version
      },
      timestamp: new Date(),
      version: session.version
    }));

    // Notify other users
    this.broadcastToSession(session, {
      type: CollaborationEventType.JOIN_SESSION,
      sessionId: event.sessionId,
      userId: event.userId,
      payload: { userJoined: event.userId },
      timestamp: new Date(),
      version: session.version
    }, [event.userId]);
  }

  private async handleUpdateAssumption(
    session: CollaborationSession | undefined,
    event: CollaborationEvent
  ) {
    if (!session) {
      throw new Error('Session not found');
    }

    // Version check to prevent conflicts
    if (event.version !== session.version) {
      await this.handleVersionConflict(session, event);
      return;
    }

    // Update session state
    session.state = {
      ...session.state,
      ...event.payload.updates
    };
    session.version++;
    session.lastModified = new Date();

    // Broadcast update to all users in session
    this.broadcastToSession(session, {
      ...event,
      version: session.version,
      timestamp: session.lastModified
    });
  }

  private async handleVersionConflict(
    session: CollaborationSession,
    event: CollaborationEvent
  ) {
    // Use AI to suggest conflict resolution
    const resolution = await this.generateConflictResolution(
      session.state,
      event.payload.updates as Partial<ValuationFormData>
    );

    // Notify users of conflict
    this.broadcastToSession(session, {
      type: CollaborationEventType.RESOLVE_CONFLICT,
      sessionId: session.id,
      userId: event.userId,
      payload: {
        conflict: {
          serverVersion: session.version,
          clientVersion: event.version,
          suggestion: resolution
        }
      },
      timestamp: new Date(),
      version: session.version
    });
  }

  private async handleConflictResolution(
    session: CollaborationSession | undefined,
    event: CollaborationEvent
  ) {
    if (!session) {
      throw new Error('Session not found');
    }

    // Apply resolved state
    session.state = event.payload.resolvedState as ValuationFormData;
    session.version++;
    session.lastModified = new Date();

    // Broadcast resolution to all users
    this.broadcastToSession(session, {
      ...event,
      version: session.version,
      timestamp: session.lastModified
    });
  }

  private async generateConflictResolution(
    currentState: ValuationFormData,
    proposedChanges: Partial<ValuationFormData>
  ): Promise<Partial<ValuationFormData>> {
    // Implement AI-assisted conflict resolution
    // This would use the hybrid AI orchestrator to analyze changes
    // and suggest optimal resolution
    return {
      ...currentState,
      ...proposedChanges,
      // Add AI suggestions for resolving conflicting fields
    };
  }

  private broadcastToSession(
    session: CollaborationSession,
    event: CollaborationEvent,
    excludeUsers: string[] = []
  ) {
    const message = JSON.stringify(event);

    session.users.forEach((ws, userId) => {
      if (!excludeUsers.includes(userId) && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  private handleDisconnect(ws: WebSocket) {
    for (const [sessionId, session] of this.sessions) {
      for (const [userId, userWs] of session.users) {
        if (userWs === ws) {
          session.users.delete(userId);
          this.broadcastToSession(session, {
            type: CollaborationEventType.LEAVE_SESSION,
            sessionId,
            userId,
            payload: { userLeft: userId },
            timestamp: new Date(),
            version: session.version
          });
          break;
        }
      }

      if (session.users.size === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private async recordCollaborationEvent(event: CollaborationEvent) {
    await auditTrailService.recordAIAssumption(
      event.userId,
      event.sessionId,
      {
        eventType: event.type,
        payload: event.payload,
        version: event.version
      },
      {
        ipAddress: "system",
        userAgent: "CollaborationService",
        sessionId: event.sessionId
      }
    );
  }
}

export const collaborationService = new CollaborationService();