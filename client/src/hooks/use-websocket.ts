import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: 'task_created' | 'task_completed' | 'task_updated' | 'user_joined' | 'user_left' | 'points_updated';
  data: any;
  userId?: number;
}

export function useWebSocket(userId: number | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate with the server
      ws.send(JSON.stringify({ type: 'auth', userId }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'task_created':
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
            if (message.userId !== userId) {
              toast({
                title: "New Task Added! 📝",
                description: `Your friend added: ${message.data.title}`,
              });
            }
            break;
            
          case 'task_completed':
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
            queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
            if (message.userId !== userId) {
              toast({
                title: "Task Completed! 🎉",
                description: `Your friend completed: ${message.data.title}`,
              });
            }
            break;
            
          case 'task_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
            break;
            
          case 'user_joined':
            if (message.data.userId !== userId) {
              setConnectedUsers(prev => [...prev, message.data.userId]);
              toast({
                title: "Friend joined! 👋",
                description: "Your study buddy is now online",
              });
            }
            break;
            
          case 'user_left':
            if (message.data.userId !== userId) {
              setConnectedUsers(prev => prev.filter(id => id !== message.data.userId));
              toast({
                title: "Friend left 👋",
                description: "Your study buddy went offline",
              });
            }
            break;
            
          case 'points_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
            queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectedUsers([]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [userId, queryClient, toast]);

  const sendMessage = (message: Omit<WebSocketMessage, 'userId'>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ ...message, userId }));
    }
  };

  return {
    isConnected,
    connectedUsers,
    sendMessage,
  };
}
