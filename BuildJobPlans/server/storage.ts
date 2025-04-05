import { JobPlan, InsertJobPlan, User, InsertUser, users, jobPlans } from "@shared/schema";
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq } from 'drizzle-orm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Job Plan methods
  createJobPlan(plan: InsertJobPlan): Promise<JobPlan>;
  getJobPlan(id: number): Promise<JobPlan | undefined>;
  getJobPlanByPlanId(planId: string): Promise<JobPlan | undefined>;
  getAllJobPlans(): Promise<JobPlan[]>;
  updateJobPlan(id: number, plan: Partial<JobPlan>): Promise<JobPlan>;
  deleteJobPlan(id: number): Promise<void>;
}

export class PostgresStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createJobPlan(plan: InsertJobPlan): Promise<JobPlan> {
    const [jobPlan] = await db.insert(jobPlans).values(plan).returning();
    return jobPlan;
  }

  async getJobPlan(id: number): Promise<JobPlan | undefined> {
    const result = await db.select().from(jobPlans).where(eq(jobPlans.id, id));
    return result[0];
  }

  async getJobPlanByPlanId(planId: string): Promise<JobPlan | undefined> {
    const result = await db.select().from(jobPlans).where(eq(jobPlans.planId, planId));
    return result[0];
  }

  async getAllJobPlans(): Promise<JobPlan[]> {
    return db.select().from(jobPlans);
  }

  async updateJobPlan(id: number, plan: Partial<JobPlan>): Promise<JobPlan> {
    const [updated] = await db.update(jobPlans)
      .set(plan)
      .where(eq(jobPlans.id, id))
      .returning();
    return updated;
  }

  async deleteJobPlan(id: number): Promise<void> {
    await db.delete(jobPlans).where(eq(jobPlans.id, id));
  }

  async incrementGenerationCount(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await db.update(users)
      .set({ generationCount: (user.generationCount || 0) + 1 })
      .where(eq(users.id, userId));
  }
}

export const storage = new PostgresStorage();