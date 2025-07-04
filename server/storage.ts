import { 
  users, 
  tasks, 
  collaborations, 
  studySessions,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type Collaboration,
  type InsertCollaboration,
  type StudySession,
  type InsertStudySession
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: number, points: number): Promise<User>;
  updateUserSpotifyTokens(id: number, accessToken: string, refreshToken: string): Promise<User>;
  updateUserBackground(id: number, backgroundImage: string): Promise<User>;
  
  // Tasks
  getTasks(userId: number): Promise<Task[]>;
  getTasksBySubject(userId: number, subject: string): Promise<Task[]>;
  getTasksByDifficulty(userId: number, difficulty: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task>;
  completeTask(id: number, userId: number): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Collaborations
  getCollaborations(userId: number): Promise<Collaboration[]>;
  createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration>;
  acceptCollaboration(id: number): Promise<Collaboration>;
  
  // Study Sessions
  getStudySessions(userId: number): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  endStudySession(id: number, duration: number): Promise<StudySession>;
  
  // Analytics
  getTaskStats(userId: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalPoints: number;
    tasksBySubject: Array<{ subject: string; count: number }>;
    tasksByDifficulty: Array<{ difficulty: number; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPoints(id: number, points: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ totalPoints: sql`${users.totalPoints} + ${points}` })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSpotifyTokens(id: number, accessToken: string, refreshToken: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ spotifyAccessToken: accessToken, spotifyRefreshToken: refreshToken })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserBackground(id: number, backgroundImage: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ backgroundImage })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.createdBy, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksBySubject(userId: number, subject: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.createdBy, userId), eq(tasks.subject, subject)))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByDifficulty(userId: number, difficulty: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.createdBy, userId), eq(tasks.difficulty, difficulty)))
      .orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async completeTask(id: number, userId: number): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ 
        isCompleted: true, 
        completedBy: userId, 
        completedAt: new Date() 
      })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getCollaborations(userId: number): Promise<Collaboration[]> {
    return await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.userId, userId))
      .orderBy(desc(collaborations.createdAt));
  }

  async createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration> {
    const [newCollaboration] = await db.insert(collaborations).values(collaboration).returning();
    return newCollaboration;
  }

  async acceptCollaboration(id: number): Promise<Collaboration> {
    const [collaboration] = await db
      .update(collaborations)
      .set({ isAccepted: true })
      .where(eq(collaborations.id, id))
      .returning();
    return collaboration;
  }

  async getStudySessions(userId: number): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.startTime));
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db.insert(studySessions).values(session).returning();
    return newSession;
  }

  async endStudySession(id: number, duration: number): Promise<StudySession> {
    const [session] = await db
      .update(studySessions)
      .set({ endTime: new Date(), duration })
      .where(eq(studySessions.id, id))
      .returning();
    return session;
  }

  async getTaskStats(userId: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalPoints: number;
    tasksBySubject: Array<{ subject: string; count: number }>;
    tasksByDifficulty: Array<{ difficulty: number; count: number }>;
  }> {
    const userTasks = await db.select().from(tasks).where(eq(tasks.createdBy, userId));
    const user = await this.getUser(userId);
    
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const tasksBySubject = userTasks.reduce((acc, task) => {
      const existing = acc.find(item => item.subject === task.subject);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ subject: task.subject, count: 1 });
      }
      return acc;
    }, [] as Array<{ subject: string; count: number }>);
    
    const tasksByDifficulty = userTasks.reduce((acc, task) => {
      const existing = acc.find(item => item.difficulty === task.difficulty);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ difficulty: task.difficulty, count: 1 });
      }
      return acc;
    }, [] as Array<{ difficulty: number; count: number }>);
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalPoints: user?.totalPoints || 0,
      tasksBySubject,
      tasksByDifficulty
    };
  }
}

export const storage = new DatabaseStorage();
