// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    passwordHash: v.string(),
  }).index("by_name", ["name"]),

  partitions: defineTable({
    creatorName: v.string(),
    name: v.string(),
    bpm: v.number(),
    // Store as JSON string for simplicity (no nested objects in Convex)
    beatsJson: v.string(), // JSON.stringify(Beat[])
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