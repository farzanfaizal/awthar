import { db } from "../db";
import { users, type UpsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User } from "@shared/schema";

export class UserService {
  static async getUserById(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  static async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values(userData)
      .returning();
    return user;
  }

  static async updateUserRole(userId: string, role: "customer" | "provider" | "both") {
    return db.update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
  }
}
