// components/MidiGrid.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useMusicStore } from '../lib/store/use_music_store';
import { PianoKey } from './piano_key';
import { BeatSlot } from './beat_slot';
import { DISPLAYED_PITCH_COUNT, DISPLAYED_BEAT_COUNT } from '../types/core';

interface MidiGridProps {
  pitchesCount?: number;
  beatCount?: number;
}

export function MidiGrid({ pitchesCount = DISPLAYED_PITCH_COUNT, beatCount = DISPLAYED_BEAT_COUNT }: MidiGridProps) {
  const centerPitch = useMusicStore((state) => state.currentCenterPitch);
  const beatOffset = useMusicStore((state) => state.currentBeatOffset);
  const version = useMusicStore((state) => state.partitionVersion);

  // Calculate pitches around center (memoized for performance)
  const pitches = useMemo(() => {
    const half = Math.floor(pitchesCount / 2);
    const pitchArray: number[] = [];

    for (let i = centerPitch + half; i > centerPitch-half; i--) {
      pitchArray.push(i);
    }

    return pitchArray;
  }, [centerPitch, pitchesCount]);

  return (
    <ScrollView
      horizontal
      style={styles.scrollContainer}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {pitches.map((pitch) => (
          <View key={pitch} style={styles.row}>
            {/* Piano key on the left */}
            <PianoKey pitch={pitch} />

            {/* Beat slots */}
            {Array.from({ length: beatCount }, (_, i) => (
              <BeatSlot
                key={`${pitch}-${beatOffset + i}-v${version}`}
                pitch={pitch}
                beatIndex={beatOffset + i}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
});