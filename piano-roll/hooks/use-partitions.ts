import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { partitionToMidi, partitionFromMidi } from "@/lib/partition_io";
import type { Partition } from "@/lib/core/music/partition";
import type { Id } from "@/convex/_generated/dataModel";

export function usePartitions(userName: string | null) {
  // Route A: Get user's partitions
  const myPartitions = useQuery(
    api.partitions.getUserPartitions,
    userName ? { creatorName: userName } : "skip"
  );

  // Route E: Get community partitions
  const communityPartitions = useQuery(
    api.partitions.getCommunityPartitions,
    { creatorName: userName ?? undefined }
  );

  // Route C: Save partition mutation
  const savePartitionMutation = useMutation(api.partitions.savePartition);

  // Route D: Delete partition mutation
  const deletePartitionMutation = useMutation(api.partitions.deletePartition);

  // Route C: function to save partition
  const savePartition = async (
    partition: Partition,
    name: string,
    bpm: number
  ): Promise<Id<"partitions">> => {
    if (!userName) throw new Error("Not logged in");

    const beats = partitionToMidi(partition);

    const uuid = await savePartitionMutation({
      creatorName: userName,
      name,
      bpm,
      beatsJson: JSON.stringify(beats),
    });

    return uuid;
  };

  // Route D: function to delete partition
  const deletePartition = async (uuid: Id<"partitions">) => {
    await deletePartitionMutation({ uuid });
  };

  return {
    myPartitions: myPartitions || [],
    communityPartitions: communityPartitions || [],
    savePartition,
    deletePartition,
  };
}

// Route B: Separate hook for loading a specific partition by UUID
export function usePartition(uuid: Id<"partitions"> | null) {
  const partitionData = useQuery(
    api.partitions.getPartitionByUuid,
    uuid ? { uuid } : "skip"
  );

  if (!partitionData) return null;

  const beats = JSON.parse(partitionData.beatsJson);
  return partitionFromMidi(
    beats,
  );
}
