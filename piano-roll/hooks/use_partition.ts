// hooks/use-partitions.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { partitionToMidi, partitionFromMidi } from "@/lib/partition_io";
import type { Partition } from "@/lib/core/music/partition";

export function usePartitions(userName: string | null) {
  const myPartitions = useQuery(
    api.partitions.getMyPartitions,
    userName ? { creatorName: userName } : "skip"
  );

  const communityPartitions = useQuery(api.partitions.getCommunityPartitions);

  const savePartitionMutation = useMutation(api.partitions.savePartition);
  const getPartitionQuery = useQuery(api.partitions.getPartition);

  const savePartition = async (
    partition: Partition,
    name: string,
    bpm: number
  ) => {
    if (!userName) throw new Error("Not logged in");

    const beats = partitionToMidi(partition);

    await savePartitionMutation({
      creatorName: userName,
      name,
      bpm,
      beatsJson: JSON.stringify(beats),
    });
  };

  return {
    myPartitions: myPartitions || [],
    communityPartitions: communityPartitions || [],
    savePartition,
  };
}