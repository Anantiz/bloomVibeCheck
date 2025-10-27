// types/core.ts - Type definitions first


// The unpacked binary struct; simpler to use
export type MusicNoteObj = {
  pitch: number;
  beatIndex: number;
  velocity: number;
  instrument: InstrumentType;
}

// Keep enum numeric values; It is used in manual binary packing; And below 1byte 2^8=256 or it breaks everything
export const enum InstrumentType {
  PIANO = 0,
  // GUITAR = 1,  // We won't do this. No time left
}

// Constants (TypeScript uses const for immutable values)
export const LOWEST_MIDI_PITCH: number = 21; // A1
export const HIGHEST_MIDI_PITCH: number = 96; // C8
export const TOTAL_PITCH_COUNT: number = HIGHEST_MIDI_PITCH - LOWEST_MIDI_PITCH + 1; // 88 keys
export const MAX_PARTITION_LEN: number = 15 * 200; // 15min at 200bpm = 3000 beats
export const ARENA_ALLOCATOR_SIZE: number = 100; // Arbitrary size

export const DISPLAYED_PITCH_COUNT: number = 8; // These are hacks and should not change; I do math to check bound checks based on these.; Must be even
export const DISPLAYED_BEAT_COUNT: number = 10; // If they change we do buffer overflows and crashes. 30s fixes>>>30mins
export const PITCH_HALF_WINDOW: number = Math.floor(DISPLAYED_PITCH_COUNT / 2);

export const PLAYBACK_BPM: number = 120;
export const BEAT_SLOT_WIDTH_RATIO: number = 1.2; // Width = height * RATIO

// MIDI pitch mapping
export const MIDI_PITCH: Record<string, number> = {
  "a1": 21,
  "a#1": 22,
  "b1": 23,
  "c2": 24,
  "c#2": 25,
  "d2": 26,
  "d#2": 27,
  "e2": 28,
  "f2": 29,
  "f#2": 30,
  "g2": 31,
  "g#2": 32,
  "a2": 33,
  "a#2": 34,
  "b2": 35,
  "c3": 36,
  "c#3": 37,
  "d3": 38,
  "d#3": 39,
  "e3": 40,
  "f3": 41,
  "f#3": 42,
  "g3": 43,
  "g#3": 44,
  "a3": 45,
  "a#3": 46,
  "b3": 47,
  "c4": 48,
  "c#4": 49,
  "d4": 50,
  "d#4": 51,
  "e4": 52,
  "f4": 53,
  "f#4": 54,
  "g4": 55,
  "g#4": 56,
  "a4": 57,
  "a#4": 58,
  "b4": 59,
  "c5": 60,
  "c#5": 61,
  "d5": 62,
  "d#5": 63,
  "e5": 64,
  "f5": 65,
  "f#5": 66,
  "g5": 67,
  "g#5": 68,
  "a5": 69,
  "a#5": 70,
  "b5": 71,
  "c6": 72,
  "c#6": 73,
  "d6": 74,
  "d#6": 75,
  "e6": 76,
  "f6": 77,
  "f#6": 78,
  "g6": 79,
  "g#6": 80,
  "a6": 81,
  "a#6": 82,
  "b6": 83,
  "c7": 84,
  "c#7": 85,
  "d7": 86,
  "d#7": 87,
  "e7": 88,
  "f7": 89,
  "f#7": 90,
  "g7": 91,
  "g#7": 92,
  "a7": 93,
  "a#7": 94,
  "b7": 95,
  "c8": 96,
  "c#8": 97,
  "d8": 98,
  "d#8": 99,
  "e8": 100,
  "f8": 101,
  "f#8": 102,
  "g8": 103,
  "g#8": 104,
  "a8": 105,
  "a#8": 106,
  "b8": 107,
  "c9": 108
} as const;
