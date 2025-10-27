// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    passwordHash: v.string(),
    sessionToken: v.optional(v.string()),
    lastLogin: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_token", ["sessionToken"]),

  partitions: defineTable({
    creatorName: v.string(),
    name: v.string(),
    bpm: v.number(),
    beatsJson: v.string(),
  })
    .index("by_creator", ["creatorName"])
    .index("by_creator_and_name", ["creatorName", "name"]),
});

// TypeScript types for your app
export type Beat = {
  beatIndex: number;
  pitch: number; // MIDI pitch
  velocity: number; // 0-127
  instrument: string; // 'piano' | 'guitar' etc
};