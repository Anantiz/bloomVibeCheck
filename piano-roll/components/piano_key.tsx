// components/PianoKey.tsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { playSound } from '../lib/audio/sound_engine'; // You'll implement this
import { useMusicStore } from '../lib/store/use_music_store';

const PITCH_NAMES = [
  'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'
];

function pitchToName(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1;
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
  const currentInstrument = useMusicStore((state) => state.currentInstrument);
  const isBlack = isBlackKey(pitch);

  const handlePress = () => {
    playSound(currentInstrument, pitch);
  };

  return (
    <Pressable
      style={[styles.key, isBlack ? styles.blackKey : styles.whiteKey]}
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
    width: 60,
    height: 40,
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