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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  userName: string | null;
  token: string | null;
  setAuth: (userName: string, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

interface MusicState extends AuthState {
  partition: Partition;
  partitionVersion: number;
  currentCenterPitch: number;
  currentBeatOffset: number;
  currentInstrument: InstrumentType;
  isPlaying: boolean;
  playbackController: PartitionPlaybackController | null;

  setPartition: (partition: Partition) => void;
  resetPartition: () => void;
  setCenterPitch: (pitch: number) => void;
  moveCenterPitch: (delta: number) => void;
  setBeatOffset: (offset: number) => void;
  moveBeatOffset: (delta: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackController: (controller: PartitionPlaybackController | null) => void;

  addNote: (pitch: number, beat: number, velocity: number) => void;
  removeNoteAt: (pitch: number, beat: number) => void;
  getNoteAt: (pitch: number, beat: number) => any;

  resetToDefaults: () => void;
}

const DEFAULT_CENTER_PITCH = 60;
const DEFAULT_INSTRUMENT = InstrumentType.PIANO;
const PITCH_STEP = 2;
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

// Helper to create default partition
function createDefaultPartition(): Partition {
  return new Partition();
}

export const useMusicStore = create<MusicState>((set, get) => ({
  // Auth state
  userName: null,
  token: null,

  setAuth: async (userName: string, token: string) => {
    try {
      await AsyncStorage.setItem('auth', JSON.stringify({ userName, token }));
      set({ userName, token });
    } catch (error) {
      console.error("Failed to save auth:", error);
    }
  },

  clearAuth: async () => {
    try {
      await AsyncStorage.removeItem('auth');
    } catch (error) {
      console.error("Failed to clear auth storage:", error);
    }

    // Reset auth state
    set({ userName: null, token: null });

    // Reset all music data
    try {
      get().resetToDefaults();
    } catch (error) {
      console.error("Failed to reset defaults:", error);
    }
  },

  loadAuth: async () => {
    try {
      const authData = await AsyncStorage.getItem('auth');
      if (authData) {
        const { userName, token } = JSON.parse(authData);
        set({ userName, token });
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
    }
  },

  // Music state
  partition: createDefaultPartition(),
  partitionVersion: 0,
  currentCenterPitch: DEFAULT_CENTER_PITCH,
  currentBeatOffset: 0,
  currentInstrument: DEFAULT_INSTRUMENT,
  isPlaying: false,
  playbackController: null,

  setPartition: (partition) => set((state) => ({
    partition,
    partitionVersion: state.partitionVersion + 1
  })),

  resetPartition: () => set((state) => ({
    partition: createDefaultPartition(),
    partitionVersion: state.partitionVersion + 1,
  })),

  setCenterPitch: (pitch) => set({ currentCenterPitch: clamp_pitch(pitch) }),

  moveCenterPitch: (delta) => set((state) => ({
    currentCenterPitch: clamp_pitch(state.currentCenterPitch + delta)
  })),

  setBeatOffset: (offset) => set({ currentBeatOffset: clamp_beat_offset(offset) }),

  moveBeatOffset: (delta) => set((state) => ({
    currentBeatOffset: clamp_beat_offset(state.currentBeatOffset + delta)
  })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setPlaybackController: (controller: PartitionPlaybackController | null) => set({ playbackController: controller }),

  addNote: (pitch, position, velocity = 127) => {
    const { partition, currentInstrument } = get();
    partition.addNote(pitch, position, velocity, currentInstrument);
    set((state) => ({ partitionVersion: state.partitionVersion + 1 }));
  },

  removeNoteAt: (pitch, position) => {
    const { partition } = get();
    partition.removeNoteAt(pitch, position);
    set((state) => ({ partitionVersion: state.partitionVersion + 1 }));
  },

  getNoteAt: (pitch, position) => {
    return get().partition.getNoteAt(pitch, position);
  },

  // Reset all music-related state to defaults
  resetToDefaults: () => {
    const state = get();

    // Stop playback if playing
    try {
      if (state.playbackController) {
        state.playbackController.cancel();
      }
    } catch (error) {
      console.error("Failed to stop playback:", error);
    }

    set({
      partition: createDefaultPartition(),
      partitionVersion: state.partitionVersion + 1,
      currentCenterPitch: DEFAULT_CENTER_PITCH,
      currentBeatOffset: 0,
      currentInstrument: DEFAULT_INSTRUMENT,
      isPlaying: false,
      playbackController: null,
    });
  },
}));

export { PITCH_STEP, BEAT_STEP, DEFAULT_INSTRUMENT };