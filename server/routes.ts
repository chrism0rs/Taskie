import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTaskSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketMessage {
  type: 'task_created' | 'task_completed' | 'task_updated' | 'user_joined' | 'user_left' | 'points_updated';
  data: any;
  userId?: number;
}

const connectedClients = new Map<WebSocket, number>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware placeholder
  const requireAuth = (req: any, res: any, next: any) => {
    // TODO: Implement proper authentication
    req.userId = 1; // Mock user ID for development
    next();
  };

  // User routes
  app.get("/api/user/profile", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user/background", requireAuth, async (req: any, res) => {
    try {
      const { backgroundImage } = req.body;
      const user = await storage.updateUserBackground(req.userId, backgroundImage);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update background" });
    }
  });

  app.put("/api/user/spotify", requireAuth, async (req: any, res) => {
    try {
      const { accessToken, refreshToken } = req.body;
      const user = await storage.updateUserSpotifyTokens(req.userId, accessToken, refreshToken);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update Spotify tokens" });
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const { subject, difficulty } = req.query;
      let tasks;
      
      if (subject) {
        tasks = await storage.getTasksBySubject(req.userId, subject as string);
      } else if (difficulty) {
        tasks = await storage.getTasksByDifficulty(req.userId, parseInt(difficulty as string));
      } else {
        tasks = await storage.getTasks(req.userId);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        createdBy: req.userId
      });
      
      const task = await storage.createTask(validatedData);
      
      // Broadcast to connected clients
      broadcastMessage({
        type: 'task_created',
        data: task,
        userId: req.userId
      });
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      
      const task = await storage.updateTask(taskId, updates);
      
      // Broadcast to connected clients
      broadcastMessage({
        type: 'task_updated',
        data: task,
        userId: req.userId
      });
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.post("/api/tasks/:id/complete", requireAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.completeTask(taskId, req.userId);
      
      // Update user points
      await storage.updateUserPoints(req.userId, task.points);
      
      // Broadcast to connected clients
      broadcastMessage({
        type: 'task_completed',
        data: task,
        userId: req.userId
      });
      
      broadcastMessage({
        type: 'points_updated',
        data: { taskId, points: task.points },
        userId: req.userId
      });
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      await storage.deleteTask(taskId);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", requireAuth, async (req: any, res) => {
    try {
      const stats = await storage.getTaskStats(req.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Study session routes
  app.get("/api/study-sessions", requireAuth, async (req: any, res) => {
    try {
      const sessions = await storage.getStudySessions(req.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  app.post("/api/study-sessions", requireAuth, async (req: any, res) => {
    try {
      const session = await storage.createStudySession({
        userId: req.userId,
        wellnessReminders: req.body.wellnessReminders || {}
      });
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create study session" });
    }
  });

  app.put("/api/study-sessions/:id/end", requireAuth, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { duration } = req.body;
      const session = await storage.endStudySession(sessionId, duration);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to end study session" });
    }
  });

  // Collaboration routes
  app.get("/api/collaborations", requireAuth, async (req: any, res) => {
    try {
      const collaborations = await storage.getCollaborations(req.userId);
      res.json(collaborations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collaborations" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'auth' && data.userId) {
          connectedClients.set(ws, data.userId);
          
          // Broadcast user joined
          broadcastMessage({
            type: 'user_joined',
            data: { userId: data.userId },
            userId: data.userId
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      const userId = connectedClients.get(ws);
      if (userId) {
        connectedClients.delete(ws);
        
        // Broadcast user left
        broadcastMessage({
          type: 'user_left',
          data: { userId },
          userId
        });
      }
    });
  });

  function broadcastMessage(message: WebSocketMessage) {
    const messageString = JSON.stringify(message);
    
    connectedClients.forEach((userId, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  return httpServer;
}
