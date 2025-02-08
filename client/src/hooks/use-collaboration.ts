import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ValuationFormData } from '@/lib/validations';

export const CollaborationEventType = {
  JOIN_SESSION: 'join_session',
  LEAVE_SESSION: 'leave_session',
  UPDATE_ASSUMPTION: 'update_assumption',
  RESOLVE_CONFLICT: 'resolve_conflict',
  SYNC_STATE: 'sync_state',
} as const;

interface CollaborationEvent {
  type: keyof typeof CollaborationEventType;
  sessionId: string;
  userId: string;
  payload: Record<string, any>;
  timestamp: Date;
  version: number;
}

interface UseCollaborationOptions {
  sessionId: string;
  userId: string;
  initialState: ValuationFormData;
  onStateChange?: (state: ValuationFormData) => void;
}

export function useCollaboration({
  sessionId,
  userId,
  initialState,
  onStateChange
}: UseCollaborationOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [version, setVersion] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Connect to WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/collab`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Join session
      ws.send(JSON.stringify({
        type: CollaborationEventType.JOIN_SESSION,
        sessionId,
        userId,
        payload: { initialState },
        timestamp: new Date(),
        version: 0
      }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Lost connection to collaboration server. Trying to reconnect...",
        variant: "destructive"
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to collaboration server",
        variant: "destructive"
      });
    };

    ws.onmessage = (event) => {
      handleCollaborationEvent(JSON.parse(event.data));
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [sessionId, userId]);

  const handleCollaborationEvent = useCallback((event: CollaborationEvent) => {
    switch (event.type) {
      case CollaborationEventType.JOIN_SESSION:
        setActiveUsers(prev => [...prev, event.payload.userJoined]);
        toast({
          title: "User Joined",
          description: `${event.payload.userJoined} joined the session`
        });
        break;

      case CollaborationEventType.LEAVE_SESSION:
        setActiveUsers(prev => prev.filter(id => id !== event.payload.userLeft));
        toast({
          title: "User Left",
          description: `${event.payload.userLeft} left the session`
        });
        break;

      case CollaborationEventType.UPDATE_ASSUMPTION:
        setVersion(event.version);
        onStateChange?.(event.payload.updates);
        break;

      case CollaborationEventType.RESOLVE_CONFLICT:
        handleConflict(event.payload.conflict);
        break;

      case CollaborationEventType.SYNC_STATE:
        setVersion(event.version);
        onStateChange?.(event.payload.state);
        break;
    }
  }, [onStateChange]);

  const handleConflict = useCallback((conflict: {
    serverVersion: number;
    clientVersion: number;
    suggestion: Partial<ValuationFormData>;
  }) => {
    toast({
      title: "Version Conflict",
      description: "Changes detected from another user. Resolving conflicts...",
      variant: "warning"
    });

    // Apply suggested resolution
    onStateChange?.(conflict.suggestion as ValuationFormData);
    setVersion(conflict.serverVersion + 1);
  }, [onStateChange]);

  const sendUpdate = useCallback((updates: Partial<ValuationFormData>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection Error",
        description: "Not connected to collaboration server",
        variant: "destructive"
      });
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: CollaborationEventType.UPDATE_ASSUMPTION,
      sessionId,
      userId,
      payload: { updates },
      timestamp: new Date(),
      version
    }));
  }, [sessionId, userId, version]);

  return {
    isConnected,
    activeUsers,
    sendUpdate,
    version
  };
}
