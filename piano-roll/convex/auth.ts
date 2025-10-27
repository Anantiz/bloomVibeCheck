import { mutation, query } from "./_generated/server";
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

// Generate a simple session token
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const register = mutation({
  args: {
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Register attempt:", args.name);

    // Validate inputs
    if (args.name.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (args.password.length < 4) {
      throw new Error("Password must be at least 4 characters");
    }

    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Username already taken");
    }

    // Create user with session token
    const token = generateToken();
    const userId = await ctx.db.insert("users", {
      name: args.name,
      passwordHash: simpleHash(args.password),
      sessionToken: token,
      lastLogin: Date.now(),
    });

    console.log("User registered:", args.name);

    return {
      userId,
      name: args.name,
      token
    };
  },
});

export const login = mutation({
  args: {
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Login attempt:", args.name);

    const user = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!user) {
      console.log("User not found:", args.name);
      throw new Error("Invalid username or password");
    }

    const passwordHash = simpleHash(args.password);
    if (user.passwordHash !== passwordHash) {
      console.log("Password mismatch for:", args.name);
      throw new Error("Invalid username or password");
    }

    // Generate new session token on login
    const token = generateToken();
    await ctx.db.patch(user._id, {
      sessionToken: token,
      lastLogin: Date.now(),
    });

    console.log("User logged in:", args.name);

    return {
      userId: user._id,
      name: user.name,
      token
    };
  },
});

export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.token))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        sessionToken: undefined,
      });
      console.log("User logged out:", user.name);
    }
  },
});

// Verify token and return user
export const verifyToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.token))
      .first();

    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      name: user.name,
    };
  },
});