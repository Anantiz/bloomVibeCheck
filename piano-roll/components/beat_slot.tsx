// components/BeatSlot.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useMusicStore } from '../lib/store/use_music_store';

const DEFAULT_VELOCITY = 100;

interface BeatSlotProps {
  pitch: number;
  beatIndex: number;
}

export function BeatSlot({ pitch, beatIndex }: BeatSlotProps) {
  const { getNoteAt, addNote, removeNoteAt } = useMusicStore();
  // """
  // Since you're destructuring methods (not data),
  // and methods are stable references
  // (they don't change), React's shallow comparison sees:
  // """

  const version = useMusicStore((state) => state.partitionVersion);
  void version; // ← Explicitly mark as "used"
  // Since the first one destructures methods the === comparison always returns true
  // Force re-render on partition change;
  // We have a separate value cuz the Partition object itself is mutable and heavy

  const hasNote = getNoteAt(pitch, beatIndex) !== null;

  const handleSinglePress = () => {
    if (!hasNote) {
      addNote(pitch, beatIndex, DEFAULT_VELOCITY);
    }
  };

  const handleDoublePress = () => {
    if (hasNote) {
      removeNoteAt(pitch, beatIndex);
    }
  };

  return (
    <Pressable
      style={[styles.slot, hasNote ? styles.slotWithNote : styles.slotEmpty]}
      onPress={handleSinglePress}
      onLongPress={handleDoublePress}
      delayLongPress={200}
    >
      <View />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 50,
    height: 40,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  slotWithNote: {
    backgroundColor: '#4ade80', // Green
  },
  slotEmpty: {
    backgroundColor: '#6b7280', // Grey
  },
});