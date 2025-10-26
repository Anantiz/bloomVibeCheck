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
  // ""Subscribe to partition (will re-render when partition changes)"" What ?
  const { getNoteAt, addNote, removeNoteAt } = useMusicStore();

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
      // React Native doesn't have native double-tap
      // We'll implement it simply
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