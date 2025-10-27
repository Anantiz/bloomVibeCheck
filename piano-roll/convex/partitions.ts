import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Route A: Fetch all partitions of a user as {name, uuid}
export const getUserPartitions = query({
  args: { creatorName: v.string() },
  handler: async (ctx, args) => {
    const partitions = await ctx.db
      .query("partitions")
      .withIndex("by_creator", (q) => q.eq("creatorName", args.creatorName))
      .collect();

    return partitions.map((p) => ({
      uuid: p._id,
      name: p.name,
    }));
  },
});

// Route B: Fetch any partition by uuid, returning serialized partition data
export const getPartitionByUuid = query({
  args: { uuid: v.id("partitions") },
  handler: async (ctx, args) => {
    const partition = await ctx.db.get(args.uuid);
    if (!partition) return null;

    return {
      creatorName: partition.creatorName,
      name: partition.name,
      bpm: partition.bpm,
      beatsJson: partition.beatsJson,
    };
  },
});

// Route C: Save a partition, returning uuid
export const savePartition = mutation({
  args: {
    creatorName: v.string(),
    name: v.string(),
    bpm: v.number(),
    beatsJson: v.string(),
  },
  handler: async (ctx, args) => {
    const uuid = await ctx.db.insert("partitions", {
      creatorName: args.creatorName,
      name: args.name,
      bpm: args.bpm,
      beatsJson: args.beatsJson,
    });

    return uuid;
  },
});

// Route D: Delete a partition by uuid
export const deletePartition = mutation({
  args: { uuid: v.id("partitions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.uuid);
  },
});

// Route E: Fetch all community partitions, excluding user's own
export const getCommunityPartitions = query({
  args: { creatorName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const allPartitions = await ctx.db.query("partitions").collect();

    return allPartitions
      .filter((p) => p.creatorName !== args.creatorName)
      .map((p) => ({
        uuid: p._id,
        name: p.name,
        creatorName: p.creatorName,
      }));
  },
});