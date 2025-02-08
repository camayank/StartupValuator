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
      console.log('Attempting WebSocket connection...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/valuation`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setIsReconnecting(false);
        setReconnectCount(0);

        toast({
          title: "Connected",
          description: "Real-time updates are now active",
        });
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        setIsConnected(false);
        handleReconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to establish real-time connection",
          variant: "destructive",
        });
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
  }, [toast]);

  // Handle reconnection
  const handleReconnect = useCallback(() => {
    if (reconnectCount >= maxReconnectAttempts) {
      toast({
        title: "Connection Failed",
        description: "Unable to establish connection. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setIsReconnecting(true);
    setReconnectCount(prev => prev + 1);

    console.log(`Attempting reconnection ${reconnectCount + 1}/${maxReconnectAttempts}`);
    setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [connect, reconnectCount, maxReconnectAttempts, reconnectInterval, toast]);

  // Handle incoming messages
  const handleMessage = useCallback((message: SocketMessage) => {
    console.log('Received WebSocket message:', message);

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
        // Handle valuation updates
        break;

      case 'analysis_progress':
        // Handle analysis progress updates
        break;
    }
  }, [toast]);

  // Send message through WebSocket
  const sendMessage = useCallback((type: string, payload?: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ 
        type, 
        payload,
        timestamp: Date.now()
      });
      console.log('Sending WebSocket message:', message);
      socket.send(message);
    } else {
      console.error('WebSocket not connected, state:', socket?.readyState);
      toast({
        title: "Connection Error",
        description: "Not connected to server",
        variant: "destructive",
      });
    }
  }, [socket, toast]);

  // Initialize connection
  useEffect(() => {
    connect();

    return () => {
      if (socket) {
        console.log('Cleaning up WebSocket connection');
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