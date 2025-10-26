// convex/partitions.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { PLAYBACK_BPM } from "../types/core";

export const savePartition = mutation({
  args: {
    creatorName: v.string(),
    name: v.string(),
    bpm: v.number(),
    beatsJson: v.string(),
  },
  handler: async (ctx, args) => {
    const partitionId = await ctx.db.insert("partitions", {
      creatorName: args.creatorName,
      name: args.name,
      bpm: PLAYBACK_BPM, // Cheat this one
      beatsJson: args.beatsJson,
    });

    return { partitionId };
  },
});

export const getMyPartitions = query({
  args: {
    creatorName: v.string(),
  },
  handler: async (ctx, args) => {
    const partitions = await ctx.db
      .query("partitions")
      .withIndex("by_creator", (q) => q.eq("creatorName", args.creatorName))
      .collect();

    return partitions.map((p) => ({
      id: p._id,
      name: p.name,
      bpm: p.bpm,
      creatorName: p.creatorName,
    }));
  },
});

export const getPartition = query({
  args: {
    partitionId: v.id("partitions"),
  },
  handler: async (ctx, args) => {
    const partition = await ctx.db.get(args.partitionId);

    if (!partition) {
      throw new Error("Partition not found");
    }

    return {
      id: partition._id,
      name: partition.name,
      bpm: partition.bpm,
      creatorName: partition.creatorName,
      beats: JSON.parse(partition.beatsJson),
    };
  },
});

export const getCommunityPartitions = query({
  handler: async (ctx) => {
    const partitions = await ctx.db
      .query("partitions")
      .collect();

    return partitions.map((p) => ({
      id: p._id,
      name: p.name,
      bpm: p.bpm,
      creatorName: p.creatorName,
    }));
  },
});