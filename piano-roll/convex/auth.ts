// convex/auth.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Super simple hash (toy project, not production!)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
}

export const register = mutation({
  args: {
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("User already exists");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      passwordHash: simpleHash(args.password),
    });

    return { userId, name: args.name };
  },
});

export const login = mutation({
  args: {
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!user || user.passwordHash !== simpleHash(args.password)) {
      throw new Error("Invalid credentials");
    }

    return { userId: user._id, name: user.name };
  },
});