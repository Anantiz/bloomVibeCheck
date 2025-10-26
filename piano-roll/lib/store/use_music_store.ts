// lib/store/useMusicStore.ts
import { create } from 'zustand';
import { Partition } from '../core/music/partition';
import { InstrumentType } from '../../types/core';

// This is your "global struct"
interface MusicState {
  // Data
  partition: Partition;
  currentCenterPitch: number;
  currentBeatOffset: number;
  currentInstrument: InstrumentType;
  isPlaying: boolean;

  // "Wrappers" = methods to mutate state
  setPartition: (partition: Partition) => void;
  setCenterPitch: (pitch: number) => void;
  moveCenterPitch: (delta: number) => void;
  setBeatOffset: (offset: number) => void;
  moveBeatOffset: (delta: number) => void;
  setPlaying: (playing: boolean) => void;

  // Partition operations
  addNote: (pitch: number, beat: number, velocity: number) => void;
  removeNoteAt: (pitch: number, beat: number) => void;
  getNoteAt: (pitch: number, beat: number) => any;
}

// Constants
const DEFAULT_CENTER_PITCH = 60; // Middle C
const DEFAULT_INSTRUMENT = InstrumentType.PIANO;
const PITCH_STEP = 3; // in semitones
const BEAT_STEP = 4;

export const useMusicStore = create<MusicState>((set, get) => ({
  // Initial state
  partition: new Partition("GodTheAllPowerful", "Divine-Creation"), // These default names are rocking
  currentCenterPitch: DEFAULT_CENTER_PITCH,
  currentBeatOffset: 0,
  currentInstrument: DEFAULT_INSTRUMENT,
  isPlaying: false,

  // Setters
  setPartition: (partition) => set({ partition }),

  setCenterPitch: (pitch) => set({ currentCenterPitch: pitch }),

  moveCenterPitch: (delta) => set((state) => ({
    currentCenterPitch: state.currentCenterPitch + delta
  })),

  setBeatOffset: (offset) => set({ currentBeatOffset: offset }),

  moveBeatOffset: (delta) => set((state) => ({
    currentBeatOffset: state.currentBeatOffset + delta
  })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  //FIXME: TODO: NOTE: WHAT IS THIS SYNTAX COMMING STRAIGHT FROM THE GATES OF HELL !!!!
  // Partition operations (these mutate the partition object)
  addNote: (pitch, beat, velocity) => {
    const { partition, currentInstrument } = get();
    partition.addNote(pitch, beat, velocity, currentInstrument);
    // Trigger re-render by creating new reference
    set({ partition: { ...partition } });
  },

  removeNoteAt: (pitch, beat) => {
    const { partition } = get();
    partition.removeNoteAt(pitch, beat);
    set({ partition: { ...partition } });
  },

  getNoteAt: (pitch, beat) => {
    return get().partition.getNoteAt(pitch, beat);
  },
}));

// Export constants for components
export { PITCH_STEP, BEAT_STEP, DEFAULT_INSTRUMENT };