// lib/store/useMusicStore.ts
import { create } from 'zustand';
import { Partition } from '../core/music/partition';
import {
  InstrumentType,
  MAX_PARTITION_LEN,
  DISPLAYED_BEAT_COUNT,
  LOWEST_MIDI_PITCH,
  HIGHEST_MIDI_PITCH,
  PITCH_HALF_WINDOW,
} from '../../types/core';

import type { PartitionPlaybackController } from '../audio/sound_engine';

interface MusicState {
  // Data
  partition: Partition;
  partitionVersion: number; // To force re-renders when partition changes, we won't CLONE such a Gigantic object
  currentCenterPitch: number;
  currentBeatOffset: number;
  currentInstrument: InstrumentType;
  isPlaying: boolean;
  playbackController: PartitionPlaybackController | null;

  // "Wrappers" = methods to mutate state
  setPartition: (partition: Partition) => void;
  setCenterPitch: (pitch: number) => void;
  moveCenterPitch: (delta: number) => void;
  setBeatOffset: (offset: number) => void;
  moveBeatOffset: (delta: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackController: (controller: PartitionPlaybackController | null) => void;

  // Partition operations
  addNote: (pitch: number, beat: number, velocity: number) => void;
  removeNoteAt: (pitch: number, beat: number) => void;
  getNoteAt: (pitch: number, beat: number) => any;
}

// Constants
const DEFAULT_CENTER_PITCH = 60; // Middle C
const DEFAULT_INSTRUMENT = InstrumentType.PIANO;
const PITCH_STEP = 2; // in semitones
const BEAT_STEP = 1;

function clamp_pitch(pitch: number): number {
  return Math.min(
    Math.max(LOWEST_MIDI_PITCH + PITCH_HALF_WINDOW, pitch),
    HIGHEST_MIDI_PITCH - PITCH_HALF_WINDOW
  );
}

function clamp_beat_offset(offset: number): number {
  return Math.min(
    Math.max(0, offset),
    MAX_PARTITION_LEN - DISPLAYED_BEAT_COUNT
  );
}


export const useMusicStore = create<MusicState>((set, get) => ({
  // Initial state
  partition: new Partition("GodTheAllPowerful", "Divine-Creation"), // These default names are rocking
  partitionVersion: 0,
  currentCenterPitch: DEFAULT_CENTER_PITCH,
  currentBeatOffset: 0,
  currentInstrument: DEFAULT_INSTRUMENT,
  isPlaying: false,
  playbackController: null,

  // Setters
  setPartition: (partition) => set({ partition }),

  setCenterPitch: (pitch) => set({ currentCenterPitch: clamp_pitch(pitch) }), // Clamp to valid piano range; Unsafe

  moveCenterPitch: (delta) => set((state) => ({
    currentCenterPitch: clamp_pitch(state.currentCenterPitch + delta)
  })),// Clamp to valid piano range; Unsafe

  setBeatOffset: (offset) => set({ currentBeatOffset: clamp_beat_offset(offset) }),

  moveBeatOffset: (delta) => set((state) => ({
    currentBeatOffset: clamp_beat_offset(state.currentBeatOffset + delta)
  })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setPlaybackController: (controller: PartitionPlaybackController | null) => set({ playbackController: controller }),

  addNote: (pitch, position, velocity = 127) => {
    const { partition, currentInstrument, partitionVersion } = get();
    partition.addNote(pitch, position, velocity, currentInstrument);
    // Trigger re-render by bumping version
    set((state) => ({ partitionVersion: state.partitionVersion + 1 }));
  },

  removeNoteAt: (pitch, position) => {
    const { partition, partitionVersion } = get();
    partition.removeNoteAt(pitch, position);
    set((state) => ({ partitionVersion: state.partitionVersion + 1 }));
  },

  getNoteAt: (pitch, position) => {
    return get().partition.getNoteAt(pitch, position);
  },
}));

// Export constants for components
export { PITCH_STEP, BEAT_STEP, DEFAULT_INSTRUMENT };