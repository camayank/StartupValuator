import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ValuationSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface SocketMessage {
  type: string;
  data?: any;
  status?: string;
  message?: string;
  timestamp?: number;
}

export function useValuationSocket(options: ValuationSocketOptions = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const { toast } = useToast();

  const maxReconnectAttempts = options.reconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use root WebSocket path to avoid routing issues
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        setReconnectCount(0);
      };

      ws.onclose = () => {
        setIsConnected(false);
        handleReconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      handleReconnect();
    }
  }, []);

  const handleReconnect = useCallback(() => {
    if (reconnectCount >= maxReconnectAttempts) {
      return;
    }

    setIsReconnecting(true);
    setReconnectCount(prev => prev + 1);

    setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [connect, reconnectCount, maxReconnectAttempts, reconnectInterval]);

  const handleMessage = useCallback((message: SocketMessage) => {
    switch (message.type) {
      case 'connection':
        if (message.status === 'connected') {
          setIsConnected(true);
        }
        break;

      case 'error':
        toast({
          title: "Error",
          description: message.message || "An error occurred",
          variant: "destructive",
        });
        break;

      case 'valuation_update':
        break;

      case 'analysis_progress':
        break;
    }
  }, [toast]);

  const sendMessage = useCallback((type: string, payload?: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      toast({
        title: "Connection Error",
        description: "Not connected to server",
        variant: "destructive",
      });
    }
  }, [socket, toast]);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    isReconnecting,
    sendMessage,
    reconnectCount,
  };
}