// components/PianoKey.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { playSingleNote } from '../lib/audio/sound_engine'; // You'll implement this
import { useMusicStore } from '../lib/store/use-music-store';
import { DISPLAYED_PITCH_COUNT, DISPLAYED_BEAT_COUNT } from '@/types/core';

const PITCH_NAMES = [
  'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'
];

function pitchToName(pitch: number): string {
  const octave = Math.floor(pitch / 12);
  const note = PITCH_NAMES[pitch % 12];
  return `${note}${octave}`;
}

function isBlackKey(pitch: number): boolean {
  const noteInOctave = pitch % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave); // Sharp notes
}

interface PianoKeyProps {
  pitch: number;
}

export function PianoKey({ pitch }: PianoKeyProps) {
  const { height } = useWindowDimensions(); // <-- GET SCREEN HEIGHT
  const currentInstrument = useMusicStore((state) => state.currentInstrument);
  const isBlack = isBlackKey(pitch);

  // Calculate dynamic dimensions
  // Use a percentage of the screen height, accounting for controls/headers
  // For simplicity, let's reserve ~10% for controls/headers, and divide the rest by pitch count
  const keyHeight = (height * 0.9) / DISPLAYED_PITCH_COUNT;
  // Make the key's width a multiple of its height to keep it proportional
  const keyWidth = keyHeight * 1.5;

  const handlePress = () => {
    playSingleNote(currentInstrument, pitch);
  };

  return (
    <Pressable
      style={[
        styles.key,
        { width: keyWidth, height: keyHeight },
        isBlack ? styles.blackKey : styles.whiteKey,
      ]}
      onPress={handlePress}
    >
      <Text style={[styles.text, isBlack && styles.blackKeyText]}>
        {pitchToName(pitch)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  whiteKey: {
    backgroundColor: '#fff',
  },
  blackKey: {
    backgroundColor: '#000',
  },
  text: {
    fontSize: 10,
    color: '#000',
  },
  blackKeyText: {
    color: '#fff',
  },
});