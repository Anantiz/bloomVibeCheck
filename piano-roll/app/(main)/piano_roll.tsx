import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MidiGrid } from '@/components/midi_grid';
import { Controls } from '@/components/controls';
import { DISPLAYED_PITCH_COUNT, DISPLAYED_BEAT_COUNT } from '@/types/core';

export default function PianoRollScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Menu button in top-right corner */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push('/menu')}
      >
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>

      <Controls />
      <MidiGrid pitchesCount={DISPLAYED_PITCH_COUNT} beatCount={DISPLAYED_BEAT_COUNT} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
});