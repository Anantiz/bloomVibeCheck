import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePartitions, usePartition } from '@/hooks/use-partitions';
import { useMusicStore } from '@/lib/store/use-music-store';
import { useAuth } from '@/hooks/use-auth';
import type { Id } from '@/convex/_generated/dataModel';

export default function CommunityScreen() {
  const router = useRouter();
  const { userName } = useAuth();

  const { communityPartitions } = usePartitions(userName);
  const [selectedUuid, setSelectedUuid] = useState<Id<"partitions"> | null>(null);
  const partition = usePartition(selectedUuid);
  const setPartition = useMusicStore((state) => state.setPartition);

  // When partition is loaded, set it in the store and navigate to piano roll
  useEffect(() => {
    if (partition && selectedUuid) {
      setPartition(partition);
      router.push('/piano-roll');
      setSelectedUuid(null);
    }
  }, [partition, selectedUuid]);

  const handleLoadToPianoRoll = (uuid: Id<"partitions">) => {
    setSelectedUuid(uuid);
  };

  return (
    <View style={styles.container}>
      {/* Menu button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push('/menu')}
      >
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Community</Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {communityPartitions.length === 0 ? (
          <Text style={styles.emptyText}>No community partitions yet</Text>
        ) : (
          communityPartitions.map((item) => (
            <View key={item.uuid} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.partitionName}>{item.name}</Text>
                  <Text style={styles.creatorName}>by {item.creatorName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.loadButton}
                  onPress={() => handleLoadToPianoRoll(item.uuid)}
                >
                  <Ionicons name="musical-notes" size={20} color="#fff" />
                  <Text style={styles.loadButtonText}>Load</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    padding: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 60,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  partitionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 14,
    color: '#999',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  loadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});