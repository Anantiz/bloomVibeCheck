// app/piano-roll.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { MidiGrid } from '../components/midi_grid';
import { Controls } from '../components/controls';

export default function PianoRollScreen() {
  return (
    <View style={styles.container}>
      <Controls />
      <MidiGrid pitchesCount={8} beatCount={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});