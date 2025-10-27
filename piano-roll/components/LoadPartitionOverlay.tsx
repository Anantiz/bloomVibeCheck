import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartitions, usePartition } from '../hooks/use-partitions';
import { useMusicStore } from '@/lib/store/use-music-store';
import type { Id } from '@/convex/_generated/dataModel';

interface LoadPartitionOverlayProps {
  userName: string;
  onClose: () => void;
}

export default function LoadPartitionOverlay({ userName, onClose }: LoadPartitionOverlayProps) {
  const { myPartitions, deletePartition } = usePartitions(userName);
  const [selectedUuid, setSelectedUuid] = React.useState<Id<"partitions"> | null>(null);
  const partition = usePartition(selectedUuid);
  const setPartition = useMusicStore((state) => state.setPartition);

  // When partition is loaded, set it in the store
  React.useEffect(() => {
    if (partition && selectedUuid) {
      setPartition(partition);
      onClose();
    }
  }, [partition, selectedUuid]);

  const handleLoad = (uuid: Id<"partitions">) => {
    setSelectedUuid(uuid);
  };

  const handleDelete = async (uuid: Id<"partitions">) => {
    await deletePartition(uuid);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Load Partition</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {myPartitions.length === 0 ? (
            <Text style={styles.emptyText}>No saved partitions</Text>
          ) : (
            myPartitions.map((item) => (
              <View key={item.uuid} style={styles.partitionItem}>
                <Text style={styles.partitionName}>{item.name}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={styles.loadButton}
                    onPress={() => handleLoad(item.uuid)}
                  >
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Load</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.uuid)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  overlayContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    maxHeight: 400,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  partitionItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partitionName: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 6,
  },
});