// components/BeatSlot.tsx
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useMusicStore } from '../lib/store/use-music-store';
import { DISPLAYED_PITCH_COUNT, DISPLAYED_BEAT_COUNT, BEAT_SLOT_WIDTH_RATIO } from '@/types/core';

const DEFAULT_VELOCITY = 100;

interface BeatSlotProps {
  pitch: number;
  beatIndex: number;
}

export function BeatSlot({ pitch, beatIndex }: BeatSlotProps) {
  const { height } = useWindowDimensions();
  const keyHeight = (height * 0.9) / DISPLAYED_PITCH_COUNT;
  const { getNoteAt, addNote, removeNoteAt } = useMusicStore();
  // """
  // Since you're destructuring methods (not data),
  // and methods are stable references
  // (they don't change), React's shallow comparison sees:
  // """

  const version = useMusicStore((state) => state.partitionVersion);
  void version;

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
      style={[
        styles.slot,
        { width: keyHeight * BEAT_SLOT_WIDTH_RATIO, height: keyHeight },
        hasNote ? styles.slotWithNote : styles.slotEmpty
      ]}
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